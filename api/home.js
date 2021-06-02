const db = require("../database/models");

async function getListings(request, response) {
    const overviews = await db.Image.find({ name: /-0.webp/ })

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
	.then(details =>{
	    response.writeHead(200, {
		"content-type": "application/json"
	    })
		.end(JSON.stringify(details));
	})
	.catch(error => console.error())
}

exports.getListings = getListings;
