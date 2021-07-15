const fs = require("fs");
const path = require("path");

const Busboy = require("busboy");

const db = require("../../database/models");
const respond = require("../../utils/respond");
const images = require("../../utils/images");

function retrieveListing(request, response) {
    let listingId;
    request.on("data", data => {
	listingId = String(data);
    });

    request.on("end", async () => {
	try {
	    const [ listing, listingImages ] = await Promise.all([
		db.Listing.findById(listingId),
		db.Image.find({ listingId })
	    ]);

	    respond.handleJSONResponse(response, { listing, listingImages })
	} catch (error) {
	    respond.handleTextResponse(response, "fail");
	}
    });
}

exports.retrieveListing = retrieveListing;
