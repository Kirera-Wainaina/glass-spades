const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const Busboy = require("busboy");

const images = require("../../utils/images.js");
const respond = require("../../utils/respond.js");
const general = require("../../utils/general");
const db = require("../../database/models.js");
const indexUtils = require("../../index-utils");

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

async function uploadListing(request, response) {
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
		    convertedFile[0].destinationPath);
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

function deleteImagesInDB(request, response) {
    const imageIds = [];
    const busboy = new Busboy({ headers: request.headers });

    busboy.on("field", (name, value) => {
	console.log(`${name}: ${value}`)
    });

    request.pipe(busboy);
}

exports.sendModelData = sendModelData;
exports.uploadListing = uploadListing;
exports.deleteImagesInDB = deleteImagesInDB;
