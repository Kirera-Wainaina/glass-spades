const db = require("../database/models");
const respond = require("../utils/respond");
const general = require("../utils/general");

async function getListings(request, response) {
    const featuredListings = await db.Listing.find({ Featured: true ,
						     Archived: false });

    const details = await Promise.all(featuredListings.map(listing => {
	return new Promise(async (resolve, reject) => {
	    const overview = await general.findFirstImage(listing._id)
	    resolve({
		    "imageSrc": overview.link,
		    "bedrooms": listing.Bedrooms,
		    "bathrooms": listing.Bathrooms,
		    "price": listing.Price,
		    "heading": listing.Heading,
		    "id": listing._id
	    })
	})
    }));

    respond.handleJSONResponse(response, details);
}

exports.getListings = getListings;
