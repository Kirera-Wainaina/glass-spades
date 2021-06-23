const Busboy = require("busboy");

const db = require("../database/models");

function getListingDetails(request, response) {
    request.on("data", async (data) => {
	try {
	    const info = JSON.parse(String(data));
	    const listing = await db.Listing.findById(info.id)
	    response.writeHead(200, {
		"content-type": "application/json"
	    })
		.end(JSON.stringify(listing));
	} catch (error) {
	    console.error();
	}
    })
}

function getListingImages(request, response) {
    request.on("data", async (data) => {
	try {
	    const info = JSON.parse(String(data));
	    const images = await db.Image.find({ listingId: info.id });
	    const imageLinks = images.map(imageDetails => {
		return {
		    link: imageDetails.link,
		    position: imageDetails.position
		}
	    });
	    response.writeHead(200, {
		"content-type": "application/json"
	    })
		.end(JSON.stringify(imageLinks));
	} catch (error) {
	    console.error()
	}
    })
}

function handleLeadInfo(request, response) {
    const busboy  = new Busboy({ headers: request.headers });
    busboy.on("field", (fieldname, value) => {
	console.log(`${fieldname}: ${value}`);
    });

    busboy.on("finish", () => console.log("Data received"))

    request.pipe(busboy);
}

exports.getListingDetails = getListingDetails;
exports.getListingImages = getListingImages;
exports.handleLeadInfo = handleLeadInfo;
