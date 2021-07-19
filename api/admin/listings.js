const Busboy = require("busboy");

const respond = require("../../utils/respond");
const db = require("../../database/models");

async function getListings(request, response) {
    try {
	const listings = await db.Listing.find({ });

	const listingsData = await Promise.all(listings.map(async listing => {
	    const image = await getListingOverviewImage(listing._id);
	    return compileListingData(listing, image)
	}));
	respond.handleJSONResponse(response, listingsData);
    } catch (error) {
	console.log(error);
	respond.handleTextResponse(response, "fail");
    }
}

function getListingOverviewImage(listingId) {
    return new Promise((resolve, reject) => {
	db.Image.findOne({ listingId, position: 0 }, (error, docs) => {
	    if (error) reject(error);
	    resolve(docs);
	})
    })
}

function compileListingData(listing, image) {
    return new Promise((resolve, reject) => {
	resolve({
	    id: listing._id,
	    heading: listing.Heading,
	    price: listing.Price,
	    link: image.link,
	    featured: listing.Featured,
	    archived: listing.Archived
	})
    })
}

function saveFeatured(request, response) {
    const busboy = new Busboy({ headers: request.headers });
    let featuredIds;

    busboy.on("field", (fieldname, value) => {
	featuredIds = JSON.parse(value);
    });

    busboy.on("finish", async () => {
	try {
	    const existingFeatured = await db.Listing.find({ Featured: true });

	    if (existingFeatured.length) {
		Promise.all(existingFeatured.map(existing => {
		    existing.Featured = false;
		    return existing.save()
		}))
	    }
	    await Promise.all(featuredIds.map(id => {
		return db.Listing.findByIdAndUpdate(id, { Featured: true });
	    }));
	    respond.handleTextResponse(response, "success")
	} catch (error) {
	    console.log(error);
	    respond.handleTextResponse(response, "fail")
	}
    })

    request.pipe(busboy);
}

exports.getListings = getListings;
exports.saveFeatured = saveFeatured;
