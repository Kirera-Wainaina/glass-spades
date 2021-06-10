const db = require("../database/models");

async function getListings(request, response) {
    const overviews = await db.Image.find({ position: 0 })

    Promise.all(overviews.map(overview => {
	return new Promise((resolve, reject) => {
	    db.Listing.findById(overview.listingId, (error, docs) => {
		if (error) reject(error);
		resolve({
		    "imageSrc": overview.link,
		    "price": docs.Price,
		    "id": docs._id
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
