const db = require("../database/models");
const email = require("../utils/email");
const respond = require("../utils/respond");
const general = require("../utils/general");
const FormDataHandler = require("../utils/formDataHandler");
const dotenv = require("dotenv");

dotenv.config();

function getListingDetails(request, response) {
    request.on("data", async (data) => {
		try {
		    const info = JSON.parse(String(data));
		    const listing = await db.Listing.findById(info.id)
			if (listing.Archived) {
				response.writeHead(200, { 'content-type': 'text/html' })
				response.end('redirect');
			} else {
		    	response.writeHead(200, {
					"content-type": "application/json"
		    	})
				.end(JSON.stringify(listing));
			}
		} catch (error) {
		    console.error();
		}
    })
}

function getListingImages(request, response) {
    request.on("data", async (data) => {
		try {
		    const info = JSON.parse(String(data));
		    const images = await db.Image.find({ listingId: info.id });
		    const imageLinks = images.map(imageDetails => {
				return {
				    link: imageDetails.link,
				    position: imageDetails.position
				}
		    });
		    response.writeHead(200, {
				"content-type": "application/json"
		    })
			.end(JSON.stringify(imageLinks));
		} catch (error) {
		    console.error()
		}
    })
}

async function handleLeadInfo(request, response) {
	try {
		const [fields] = await new FormDataHandler(request).run();
		const parsed_url = new URL(fields.link, process.env.URL);
		fields["listingId"] = parsed_url.searchParams.get("id");
		const lead = new db.Lead(fields);
		const [ emailStatus, savedLead ] = await Promise.all(
			[email.emailLead(fields), lead.save()]
		);
	
		if (emailStatus.accepted.length && savedLead) {
				respond.handleTextResponse(response, "success");
		} else {
				throw new Error("Email failed or lead wasn't saved")
		}
	} catch (error) {
		console.log(error);
		response.writeHead(500, {"content-type": "text/plain"});
		response.end("fail")
	}
}

function getRelatedListings(request, response) {
    request.on("data", async data => {
		try {
		    const info = JSON.parse(data);
		    const currentListing = await db.Listing.findById(info.id);
		    const relatedListings = await db.Listing.find(
				{
					Bedrooms: currentListing.Bedrooms,
					Mandate: currentListing.Mandate,
					Archived: false
		    	}, 
				{ 
					Heading: 1, 
					Bedrooms: 1, 
					Bathrooms: 1,
			 		Price: 1,
					Size: 1, 
					"Unit Type": 1, 
					Category: 1 
				}
			);

		    if (relatedListings.length) {
				const data = await general.getDetailsForHouseCard(relatedListings);
				respond.handleJSONResponse(response, data)
		    } else {
				respond.handleTextResponse(response, "fail")
		    }
		} catch (error) {
		    console.log(error);
		}
    })
}

exports.getListingDetails = getListingDetails;
exports.getListingImages = getListingImages;
exports.handleLeadInfo = handleLeadInfo;
exports.getRelatedListings = getRelatedListings;
