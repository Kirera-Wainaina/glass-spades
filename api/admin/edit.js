const fsPromises = require('fs/promises');
const qs = require("querystring");

const db = require("../../database/models");
const respond = require("../../utils/respond");
const images = require("../../utils/images");
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

async function updateListing(request, response) {
	try {
		const [fields, files, imageNamesAndPositions] = await new FormDataHandler(request).run();
		fields['Location'] = {
			coordinates: [ fields.Longitude, fields.Latitude ]
		};
		let metadata;
	
		if (files.length) {
			metadata = await saveFiles(files);
			await saveImagesToDB(fields, metadata, imageNamesAndPositions);
		}
		await updateExistingFiles(fields.fileId)
		await db.Listing.updateOne({ _id: fields.id}, fields);
	
		respond.handleTextResponse(response, "success");
	} catch (error) {
		console.log(error)
		respond.handleTextResponse(response, "fail");
	}
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

function saveImagesToDB(listing, metadata, imageNamesAndPositions) {
    return Promise.all(metadata.map(imageMeta => {
		const position = imageNamesAndPositions.filter(
		    data => `${data.name}.webp` == imageMeta.name
		)[0].position;
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

function urlifySentence(sentence) {
    return sentence
        .toLowerCase()
        .trim()
        .replace(/ /g, '-')
  	    .replace(/[^A-Za-z-]/g, '')
}

    
exports.retrieveListing = retrieveListing;
exports.updateListing = updateListing;
exports.urlifySentence = urlifySentence;