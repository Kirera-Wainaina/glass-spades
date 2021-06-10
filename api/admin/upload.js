const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");

const Busboy = require("busboy");

const images = require("../../utils/images.js");
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
 		const file = await images.minifyImage(route);
		fs.unlink(route, error => console.error());
		const cloudFile = await images.saveImage(file[0].destinationPath);
		fs.unlink(file[0].destinationPath, error => console.error());
		const [ metadata ] = await images.getFileMetadata(cloudFile)
		const imageInfo = {
		    googleId: metadata["id"],
		    link: metadata["mediaLink"],
		    name: metadata["name"],
		    contentType: metadata["contentType"],
		    position: nameSplit[2]
		};
		imageMetadata.push(imageInfo);
		emitter.emit("uploaded", listing, imageMetadata, response);
	    })
    })

    busboy.on("finish", () => {
	// console.log(listing);
	console.log("All the data is received")
	// Let the program know all the data is in
    })
    
    request.pipe(busboy);
}

emitter.on("uploaded", async (listing, imageMetadata, response) => {

    if (listing.imageNum == imageMetadata.length) {
	listing["Location"] = {
	    coordinates: [ listing.Longitude, listing.Latitude ]
	};
	const newListing = new db.Listing(listing);
	await newListing.save()
	console.log("Finished saving to db")
	saveImageMetadata(imageMetadata, newListing._id)
	    .then(results => {
		response.writeHead(200, {
		    "content-type": "text/plain",
		})
		    .end("success")
	    })
    }
})

function saveImageMetadata(imageMetadata, listingId) {

    const promiseArray = imageMetadata.map(data => {
	data["listingId"] = listingId;
	const newImage = new db.Image(data);
	return new Promise((resolve, reject) => {
	    newImage.save()
		.then(doc => resolve(doc))
		.catch(error => console.error());
	})
    });

    return Promise.all(promiseArray)
}

exports.sendModelData = sendModelData;
exports.uploadListing = uploadListing;
