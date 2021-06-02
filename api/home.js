const db = require("../database/models");

async function getListings(request, response) {
    const overviews = await db.Image.find({ name: /-0.webp/ })
    console.log(overviews)
    Promise.all(overviews.map(overview => {
	return new Promise((resolve, reject) => {
	    db.Listing.findById(overview.listingId, (error, docs) => {
		if (error) reject(error);
		resolve({
		    "imageSrc": overview.link,
		    "price": docs.Price
		});
	    })
	})
    }))
	.then(details => console.log(details))
	.catch(error => console.error())
}

exports.getListings = getListings;
