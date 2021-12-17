const url = require("url");
const path = require("path");

const db = require("../database/models");
const indexUtils = require("../index-utils");
const respond = require("./respond");

function deleteFromRouteCache(page) {
    if (indexUtils.routeCache.has(page)) {
	indexUtils.routeCache.delete(page);
    }
}

async function getListings(request, response) {
    // const parsed_url = url.parse(request.url);
    const parsed_url = new URL(request.url, "https://ab.c")
    const searchParams = parsed_url.searchParams;
    const page = path.basename(path.dirname(parsed_url.pathname));
    let mandate;

    if (page == "sales")  {
	mandate = "Sale"
    } else {
	mandate = "Rent"
    }

    const query = createQuery(searchParams, mandate);
    // const listings = await db.Listing.find({ Mandate: mandate, Archived: false },
    const listings = await db.Listing.find(query,
					  {
					      Heading: 1,
					      Price: 1,
					      Bedrooms: 1,
					      Bathrooms: 1,
					      Size: 1,
					      "Unit Type": 1,
					      Category: 1
					  });
    if (listings.length) {
	const data = await Promise.all(listings.map(listing => {
	    return new Promise(async (resolve, reject) => {
		const imageData = await db.Image.findOne({ listingId: listing._id,
							   position: 0 });
		// _doc is to bring only the listing properties without the object's
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
	}));
	respond.handleJSONResponse(response, data);
    } else {
	respond.handleTextResponse(response, "fail");
    }

}

function createQuery(searchParams, mandate) {
    const query = { Mandate: mandate, Archived: false };
    if (searchParams.has("bedrooms")) {
	const value = searchParams.get("bedrooms");
	query["Bedrooms"] = { $eq: value == "Studio" ? value : Number(value) };
    }
    if (searchParams.has("location")) {
	query["Location Name"] = searchParams.get("location");
    }
    console.log(query)
    return query;
}

exports.deleteFromRouteCache = deleteFromRouteCache;
exports.getListings = getListings;
