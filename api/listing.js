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
	    const relatedListings = await db.Listing.find({
		Bedrooms: currentListing.Bedrooms,
		Mandate: currentListing.Mandate
	    }, { Heading: 1, Bedrooms: 1, Bathrooms: 1,
		 Price: 1, Size: 1, "Unit Type": 1, Category: 1 });

	    if (relatedListings.length) {
		const data = await Promise.all(relatedListings.map(listing => {
		    return new Promise((resolve, reject) => {
			const imageData = db.Image.findOne({
			    listingId: listing._id, position: 0 });

			resolve({
			    heading: listing.Heading,
			    price: listing.Price,
			    bedrooms: listing.Bedrooms,
			    bathrooms: listing.Bathrooms,
			    size: listing.Size,
			    unitType: listing["Unit Type"],
			    category: listing.Category,
			    imageSrc: imageData.link,
			    id: listing._id
			});

		    })
		}))
		respond.handleJSONResponse(response, data)
	    } else {
		respond.handleTextResponse(response, "fail")
	    }
	} catch (error) {
	    console.log(error);
	}
    })
}

exports.getListingDetails = getListingDetails;
exports.getListingImages = getListingImages;
exports.handleLeadInfo = handleLeadInfo;
exports.getRelatedListings = getRelatedListings;
