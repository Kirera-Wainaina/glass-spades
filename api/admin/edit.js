const fs = require("fs");
const fsPromises = require('fs/promises');
const path = require("path");
const qs = require("querystring");

const Busboy = require("busboy");

const db = require("../../database/models");
const respond = require("../../utils/respond");
const images = require("../../utils/images");
const indexUtils = require("../../index-utils");
const FormDataHandler = require("../../utils/formDataHandler");

function retrieveListing(request, response) {
    let listingId;
    request.on("data", data => {
		listingId = String(data);
    });

    request.on("end", async () => {
		try {
		    const [ listing, listingImages ] = await Promise.all([
				db.Listing.findById(listingId, { Featured: 0, Archived: 0 }),
				db.Image.find({ listingId })
		    ]);

		    respond.handleJSONResponse(response, { listing, listingImages })
		} catch (error) {
		    respond.handleTextResponse(response, "fail");
		}
    });
}


function updateListing_(request, response) {
    const busboy = new Busboy({ headers: request.headers });
    const listing = {};
    const fileNames = [];
    let counter = 0;
    
    busboy.on("field", (fieldname, value) => {
		if (
			fieldname == "External Features" || 
			fieldname == "Internal Features" ||
		    fieldname == "fileId"
		) {
		    if (listing[fieldname]) {
				listing[fieldname].push(value);
		    } else {
				listing[fieldname] = [value];
		    }
		} else {
		    listing[fieldname] = value;
		}
    })

    busboy.on("file", (fieldname, file) => {
		const imageInfo = qs.parse(fieldname);
		fileNames.push(imageInfo);

		const imageRoute = path.join(
		    path.dirname(path.dirname(__dirname)), 
			"uploaded", 
			imageInfo.name
		);

		file.pipe(fs.createWriteStream(imageRoute))
		    .on("error", error => {
				console.log("error while saving image to uploads folder");
				console.log(error);
		    })
		    .on("finish", async () => {
				counter++
				if (counter == listing.imageNum) {
				    try {
						listing["Location"] = {
						    coordinates: [ listing.Longitude, listing.Latitude ]
						};

						// From the promise, only the first result is needed.
						const [ metadata ] = await Promise.all([
						    saveFiles(fileNames),
						    updateExistingFiles(listing.fileId),
						]);

						if (metadata && metadata.length) {
						    await saveToDB(listing, metadata, fileNames);
						}

				    } catch (error) {
						console.log(error)
						respond.handleTextResponse(response, "fail");
				    }
				}
		    })
    })

    busboy.on("finish", async () => {
		console.log("All data received")

		if (counter == 0) {
		    // if no files have been received, then existing files have not yet
		    // been updated
		    updateExistingFiles(listing.fileId)
		}

		listing["Location"] = {
		    coordinates: [ listing.Longitude, listing.Latitude ]
		};
		// delete listing page from cache
		indexUtils.routeCache.delete(`/listing-${listing.id}`)
		// delete sales, rentals and filter pages from cache
		// delete admin/listings page
		for (key of indexUtils.routeCache.keys()) {
		    if (key.includes("/sales") || 
				key.includes("/rentals") ||
				key.includes("/admin") || 
				key.includes("/") ||
				key.includes("/listings")
			) {
				indexUtils.routeCache.delete(key);
		    }
		}
		await db.Listing.updateOne({ _id: listing.id}, listing);

		respond.handleTextResponse(response, "success");
    })
    
    request.pipe(busboy);
}

async function updateListing(request, response) {
	const [fields, files] = await new FormDataHandler(request).run();
	fields['Location'] = {
		coordinates: [ fields.Longitude, fields.Latitude ]
	};
	let metadata;

	if (files.length) {
		metadata = await saveFiles(files);
	}
	// console.log(fields);
	// console.log(files);
	console.log(metadata)
}

function updateExistingFiles(filedata) {
    if (filedata && filedata.length) {
		return Promise.all(filedata.map(data => {
		    return new Promise((resolve, reject) => {
				const dataObj = qs.parse(data);
				db.Image.updateOne(
				    { _id: dataObj.name },
				    { position: dataObj.position},
				    (error, result) => {
						if (error) console.log(`${filename} not exist`);
						console.log("Updated existing images")
						resolve(result)
				    })
		    })
		}))
    } else {
		return ;
    }
}

async function saveFiles(filePaths) {
	const imageMinMetadata = await Promise.all(
		filePaths.map(filePath => images.minifyImage(filePath))
	);
	const cloudFiles = await Promise.all(
		imageMinMetadata.flat().map(file => images.saveImage(file.destinationPath))
	);
	const cloudFileMetadata = await Promise.all(
		cloudFiles.map(file => file.getMetadata().then(data => data[0]))
	);

	const filesOnDisk = imageMinMetadata.flatMap(
		data => [data[0].destinationPath, data[0].sourcePath]
	);
	await Promise.all(filesOnDisk.map(file => fsPromises.unlink(file)));
	return cloudFileMetadata
}

function saveToDB(listing, metadata, extraData) {
    return Promise.all(metadata.map(imageMeta => {
		const position = extraData.filter(
		    data => `${data.name}.webp` == imageMeta.name)[0].position;
		const imageModel = new db.Image({
		    listingId: listing.id,
		    position,
		    googleId: imageMeta.id,
		    link: imageMeta.mediaLink,
		    name: imageMeta.name,
		    contentType: imageMeta.contentType
		});

		console.log("saved updates to db")
		return imageModel.save();
    }))
}
    
exports.retrieveListing = retrieveListing;
exports.updateListing = updateListing;