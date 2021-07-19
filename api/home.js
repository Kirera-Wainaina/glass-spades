const db = require("../database/models");
const respond = require("../utils/respond");

async function getListings(request, response) {
    const featuredListings = await db.Listing.find({ Featured: true ,
						     Archived: false });

    const details = await Promise.all(featuredListings.map(listing => {
	return new Promise(async (resolve, reject) => {
	    const overview = await db.Image.findOne({ listingId: listing._id,
						      position: 0 });
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
