const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const Busboy = require("busboy");

const images = require("../../utils/images.js");
const respond = require("../../utils/respond.js");
const db = require("../../database/models.js");

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

function uploadListing(request, response) {
    const busboy = new Busboy({ headers: request.headers });
    const listing = {};
    const imageMetadata = [];
    const fileNames = [];

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

    busboy.on("file", (fieldname, file, filename, encoding) => {
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
		try {
		    fileNames.push({ name, position: nameSplit[2] });
		    if (fileNames.length == listing.imageNum) {
			const convertedFiles = await Promise.all(
			    fileNames.map(filename => images.minifyImage(
				path.join(imageFolder,
					  "uploaded",
					  filename.name))));

			const cloudFiles = await Promise.all(
			    convertedFiles.map(convertedFile => images.saveImage(
				convertedFile[0].destinationPath)));

			const googleMetadata = await Promise.all(
			    cloudFiles.map(cloudFile => images.getFileMetadata(
				cloudFile)));
			const metadata = googleMetadata.map((data, index) => {
			    const [ itemMetadata ] = googleMetadata[index];
			    return itemMetadata
			});
			convertedFiles.forEach(file => fs.unlinkSync(
			    file[0].sourcePath));
			convertedFiles.forEach(file => fs.unlinkSync(
			    file[0].destinationPath));

			const listingId = saveListingToDB(listing);
			await saveImageToDB(listingId, fileNames, metadata);
			respond.handleTextResponse(response, "success");
		    }
		} catch (error) {
		    console.log(error);
		    respond.handleTextResponse(response, "fail")
		}
	    })
    })

    busboy.on("finish", () => {
	// console.log(listing);
	console.log("All the data is received")
	// Let the program know all the data is in
    })
    
    request.pipe(busboy);
}

async function saveListingToDB(listing) {
    listing["Location"] = {
	coordinates: [ listing.Longitude, listing.Latitude ]
    };
    const newListing = new db.Listing(listing);
    await newListing.save()
    return newListing._id
}

function savesImageToDB(listingId, fileNames, metadata) {
    return Promise.all(metadata.map(imageMeta => {
	const position = fileNames.filter(
	    fileName => `${fileName.name}.webp` == imageMeta.name)[0].position;
	const imageModel = new db.Image({
	    listingId,
	    position,
	    googleId: imageMeta.id,
	    link: imageMeta.mediaLink,
	    name: imageMeta.name,
	    contentType: imageMeta.contentType
	});
	return imageModel.save();
    }))
}

exports.sendModelData = sendModelData;
exports.uploadListing = uploadListing;
