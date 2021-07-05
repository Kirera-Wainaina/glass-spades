const db = require("../database/models");
const respond = require("../utils/respond");

async function getRentals(request, response) {
    const rentals = await db.Listing.find({ Mandate: "Rent" },
					  {
					      Heading: 1,
					      Price: 1,
					      Bedrooms: 1,
					      Bathrooms: 1
					  });
    if (rentals.length) {
	const data = await Promise.all(rentals.map(rental => {
	    return new Promise(async (resolve, reject) => {
		const imageData = await db.Image.findOne({ listingId: rental._id,
							   position: 0 });
		// _doc is to bring only the rental properties without the object's
		resolve({
		    heading: rental.Heading,
		    price: rental.Price,
		    bedrooms: rental.Bedrooms,
		    bathrooms: rental.Bathrooms,
		    imageSrc: imageData.link
		});
	    })
	}));
	respond.handleJSONResponse(response, data);
    } else {
	respond.handleTextResponse(response, "fail");
    }
}

exports.getRentals = getRentals;
