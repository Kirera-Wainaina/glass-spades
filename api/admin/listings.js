const Busboy = require("busboy");

const respond = require("../../utils/respond");
const general = require("../../utils/general");
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

    general.deleteFromRouteCache("/");
    general.deleteFromRouteCache("/sales");
    general.deleteFromRouteCache("/rentals");
    
    busboy.on("field", (fieldname, value) => {
	featuredIds = JSON.parse(value);
    });

    busboy.on("finish", async () => {
	try {
	    const existingFeatured = await db.Listing.find({ Featured: true });

	    if (existingFeatured.length) {
		await Promise.all(existingFeatured.map(existing => {
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

function saveArchived(request, response) {
    const busboy = new Busboy({ headers: request.headers });
    let archivedIds

    general.deleteFromRouteCache("/rentals");
    general.deleteFromRouteCache("/");
    general.deleteFromRouteCache("/sales");
    
    busboy.on("field", (fieldname, value) => {
	archivedIds = JSON.parse(value);
    })

    busboy.on("finish", async () => {
	try {
	    const existingArchived = await db.Listing.find({ Archived: true});
	    if (existingArchived.length) {
		await Promise.all(existingArchived.map(existing => {
		    existing.Archived = false;
		    return existing.save();
		}))
	    }
	    await Promise.all(archivedIds.map(id => {
		return db.Listing.findByIdAndUpdate(id, { Archived: true });
	    }))
	    respond.handleTextResponse(response, "success");
	} catch (error) {
	    console.log(error);
	    respond.handleTextResponse(response, "fail");
	}
    })

    request.pipe(busboy);
}

exports.getListings = getListings;
exports.saveFeatured = saveFeatured;
exports.saveArchived = saveArchived;
