const fs = require("fs");
const path = require("path");
const Busboy = require("busboy");

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

    busboy.on("field", (fieldname, value) => {
	if (fieldname == "Mandate" || fieldname == "Category"
	    || fieldname == "Bedrooms" || fieldname == "Bathrooms") {
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
	const route = path.join(imageFolder, "images", filename);
	file.pipe(fs.createWriteStream(route))
    })

    busboy.on("finish", () => {
	console.log(listing)
    })
    
    request.pipe(busboy);
}

exports.sendModelData = sendModelData;
exports.uploadListing = uploadListing;
