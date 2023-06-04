const fs = require("fs");
const fsPromises = require('fs/promises');
const path = require("path");

const Busboy = require("busboy");

const images = require("../../utils/images.js");
const respond = require("../../utils/respond.js");
const { deleteFilterPages } = require("../../utils/general.js");
const db = require("../../database/models.js");
const FormDataHandler = require("../../utils/formDataHandler.js");
const serverRender = require('../../utils/serverRender.js');

function sendModelData(request, response) {
    const modelPath = `${path.dirname(path.dirname(__dirname))}/utils/model.json`;

    response.writeHead(200, {
		"content-type": "application/json"
    });
    
    fs.createReadStream(modelPath)
	.pipe(response)
}

async function uploadListing(request, response) {
	try {
		const [fields, filePaths, imageNamesAndPositions] = await new FormDataHandler(request).run();
		fields['Location'] = {
			coordinates: [ fields.Longitude, fields.Latitude ]
		};

		let listing = await new db.Listing();
		const listingId = listing._id;

		const cloudMetadata = await saveImagesToCloud(filePaths);
		await saveImagesToDB(listingId, cloudMetadata, imageNamesAndPositions);

		listing = Object.assign(listing, fields);
		await listing.save();
		await serverRender.renderListingRelatedPages(listingId, fields.Heading, fields.Mandate);
		await deleteFilterPages()
		respond.handleTextResponse(response, "success");
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

function saveImagesToDB(listingId, metadata, imageNamesAndPositions) {
    return Promise.all(metadata.map(imageMeta => {
		const position = imageNamesAndPositions.filter(
		    data => `${data.name}.webp` == imageMeta.name
		)[0].position;
		const imageModel = new db.Image({
		    listingId,
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
 
function deleteImagesInDB(request, response) {
    const imageIds = [];
    const busboy = Busboy({ headers: request.headers });

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
exports.saveImagesToDB = saveImagesToDB;