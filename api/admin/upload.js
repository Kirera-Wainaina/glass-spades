const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const Busboy = require("busboy");

const images = require("../../utils/images.js");
const respond = require("../../utils/respond.js");
const general = require("../../utils/general");
const db = require("../../database/models.js");
const indexUtils = require("../../index-utils");
const FormDataHandler = require("../../utils/formDataHandler.js");
const images = require("../../utils/images");

class Emitter extends EventEmitter {};
const emitter = new Emitter();

function sendModelData(request, response) {
    const modelPath = `${path.dirname(path.dirname(__dirname))}/utils/model.json`;

    response.writeHead(200, {
		"content-type": "application/json"
    });
    
    fs.createReadStream(modelPath)
	.pipe(response)
}

async function uploadListing_(request, response) {
    const busboy = new Busboy({ headers: request.headers });
    let listing = await new db.Listing();
    const listingId = listing._id;
    
    busboy.on("field", (fieldname, value) => {
		if (fieldname == "External Features" || fieldname == "Internal Features") {
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
		const nameSplit = fieldname.split("-");
		const name = `${nameSplit[0]}-${nameSplit[1]}`;
		const imageFolder = path.dirname(path.dirname(__dirname));
		const route = path.join(imageFolder, "uploaded", name);
		
		file.pipe(fs.createWriteStream(route))
		    .on("error", error => {
				console.log("Error When writing image to file")
				console.log(error)
		    })
		    .on("finish", async () => {
				const convertedFile = await images.minifyImage(route);
				await images.saveImage(convertedFile[0].destinationPath);
				const [ metadata ] = await images.getFileMetadata(
				    convertedFile[0].destinationPath
				);
				fs.unlinkSync(convertedFile[0].destinationPath);
				fs.unlinkSync(convertedFile[0].sourcePath);
				const imageModel = new db.Image({
				    listingId,
				    position: nameSplit[2],
				    googleId: metadata.id,
				    link: metadata.mediaLink,
				    name: metadata.name,
				    contentType: metadata.contentType
				});
				await imageModel.save()
		    })
    })

    busboy.on("finish", async () => {
		console.log("Data received");
		listing["Location"] = {
		    coordinates: [ listing.Longitude, listing.Latitude ]
		};

		// delete sales, rentals and filter pages from cache
		for (key of indexUtils.routeCache.keys()) {
		    if (key.includes("/sales") || key.includes("/rentals")) {
			indexUtils.routeCache.delete(key);
		    }
		}
		indexUtils.routeCache.delete("/admin/listings");
		await listing.save()

		respond.handleTextResponse(response, "success");
    })

    request.pipe(busboy)
}

async function uploadListing(request, response) {
	try {
		const [fields, filePaths, imageNamesAndPositions] = await new FormDataHandler(request).run();
		fields['Location'] = {
			coordinates: [ fields.Longitude, fields.Latitude ]
		};

		let listing = await new db.Listing();
		const listingId = listing._id;

		await saveFiles(filePaths);
		console.log(fields, files, imageNamesAndPositions);
	} catch (error) {
		console.log(error)
		respond.handleTextResponse(response, "fail");
	}

}

async function saveImagesToCloud(filePaths) {
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

function deleteImagesInDB(request, response) {
    const imageIds = [];
    const busboy = new Busboy({ headers: request.headers });

    busboy.on("field", (name, value) => {
		imageIds.push(value)
    });

    busboy.on("finish", async () => {
	Promise.all(imageIds
		    .map(imageId => db.Image.findOneAndDelete({ _id: String(imageId)})))
	    .then(documents => Promise.all(documents.map(document => images.deleteImageFromCloud(document.name))))
	    .then(apiResponses => respond.handleTextResponse(response, "success"))
    })

    request.pipe(busboy);
}

exports.sendModelData = sendModelData;
exports.uploadListing = uploadListing;
exports.deleteImagesInDB = deleteImagesInDB;
exports.saveImagesToCloud = saveImagesToCloud;