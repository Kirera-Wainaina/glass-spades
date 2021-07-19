const db = require("../database/models");
const respond = require("../utils/respond");

async function getSales(request, response) {
    const sales = await db.Listing.find({ Mandate: "Sale", Archived: false },
					  {
					      Heading: 1,
					      Price: 1,
					      Bedrooms: 1,
					      Bathrooms: 1
					  });
    if (sales.length) {
	const data = await Promise.all(sales.map(sale => {
	    return new Promise(async (resolve, reject) => {
		const imageData = await db.Image.findOne({ listingId: sale._id,
							   position: 0 });
		// _doc is to bring only the sale properties without the object's
		resolve({
		    heading: sale.Heading,
		    price: sale.Price,
		    bedrooms: sale.Bedrooms,
		    bathrooms: sale.Bathrooms,
		    imageSrc: imageData.link,
		    id: sale._id
		});
	    })
	}));
	respond.handleJSONResponse(response, data);
    } else {
	respond.handleTextResponse(response, "fail");
    }
}

exports.getSales = getSales;
