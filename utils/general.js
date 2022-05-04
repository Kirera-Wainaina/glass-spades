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
	const data = await getDetailsForHouseCard(listings)
	respond.handleJSONResponse(response, data);
    } else {
	respond.handleTextResponse(response, "fail");
    }

}

function createQuery(params, mandate) {
    const query = { Mandate: mandate, Archived: false };
    if (params.has("bedrooms")) {
	const value = params.get("bedrooms");
	query["Bedrooms"] = value == "Studio" ? { $eq: value } : value;
    }
    if (params.has("location")) {
	query["Location Name"] = params.get("location");
    }
    if (params.has("min-price") && params.has("max-price")) {
	query["Price"] = { $gte: params.get("min-price"),
			   $lte: params.get("max-price")};
    }
    return query;
}

function getDetailsForHouseCard(listings) {
    return Promise.all(listings.map(listing => compileHouseCardDetails(listing)));
}

function compileHouseCardDetails(listing, position=0) {
    return new Promise(async (resolve, reject) => {
	const imageData = await findFirstImage(listing._id)
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
}

async function findFirstImage(listingId, position=0) {
    let imageData = await db.Image.findOne({ listingId, position });
    if (imageData == null) {
	return findFirstImage(listingId, position + 1);
    } else {

	return imageData
    }
}

exports.deleteFromRouteCache = deleteFromRouteCache;
exports.getListings = getListings;
exports.getDetailsForHouseCard = getDetailsForHouseCard;
module.exports.findFirstImage = findFirstImage;
