const url = require("url");
const qs = require("querystring");

const Busboy = require("busboy");

const db = require("../database/models");
const email = require("../utils/email");
const respond = require("../utils/respond");

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
    console.log("Lead request received")
    const busboy  = new Busboy({ headers: request.headers });
    const leadDetails = {};
    busboy.on("field", (fieldname, value) => {
	leadDetails[fieldname] = value;
    });

    busboy.on("finish", async () => {
	const query = qs.parse(url.parse(leadDetails.link).query)
	leadDetails["listingId"] = query.id;
	const lead = new db.Lead(leadDetails)
	const [ emailStatus, savedLead ] = await Promise.all(
	    [email.emailLead(leadDetails), lead.save()]);
	
	if (emailStatus.accepted.length && savedLead) {
	    respond.handleTextResponse(response, "success");
	} else {
	    respond.handleTextResponse(response, "fail");
	}
    })

    request.pipe(busboy);
}

function getRelatedListings(request, response) {
    request.on("data", async data => {
	try {
	    const info = JSON.parse(data);
	    const currentListing = await db.Listing.findById(info.id);
	    console.log(currentListing)
	} catch (error) {
	    console.log(error);
	}
    })
}

exports.getListingDetails = getListingDetails;
exports.getListingImages = getListingImages;
exports.handleLeadInfo = handleLeadInfo;
exports.getRelatedListings = getRelatedListings;
