const fs = require("fs");
const path = require("path");
const Busboy = require("busboy");

const images = require("../../utils/images.js");

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
	if (fieldname == "Mandate" || fieldname == "Category"
	    || fieldname == "Bedrooms" || fieldname == "Bathrooms"
	    || fieldname == "imageNum") {
	    listing[fieldname] = value;
	} else if (fieldname == "External Features"
		   || fieldname == "Internal Features") {
	    
	    if (listing[fieldname]) {
		listing[fieldname].push(value);
	    } else {
		listing[fieldname] = [value];
	    }
	}

    })

    busboy.on("file", (fieldname, file, filename, encoding) => {
	const imageFolder = path.dirname(path.dirname(__dirname));
	const route = path.join(imageFolder, "uploaded", fieldname);
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
		// console.log(metadata)
		const imageInfo = {
		    googleId: metadata["id"],
		    link: metadata["mediaLink"],
		    name: metadata["name"],
		    contentType: metadata["contentType"]
		};
		imageMetadata.push[imageInfo]
		if (imageMetadata.length == listing.imageNum) {
		    console.log(images);
		}
	    })
    })

    busboy.on("finish", () => {
	console.log(listing)
	// Let the program know all the data is in
    })
    
    request.pipe(busboy);
}

function saveData(listing) {

}

exports.sendModelData = sendModelData;
exports.uploadListing = uploadListing;
