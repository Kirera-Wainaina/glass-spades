const qs = require("querystring");

const db = require("../../database/models");
const respond = require("../../utils/respond");
const FormDataHandler = require("../../utils/formDataHandler");
const serverRender = require("../../utils/serverRender");
const { saveImagesToCloud, saveImagesToDB } = require('./upload');
const { deleteFilterPages } = require('../../utils/general');

function retrieveListing(request, response) {
    let listingId;
    request.on("data", data => {
		listingId = String(data);
    });

    request.on("end", async () => {
		try {
		    const [ listing, listingImages ] = await Promise.all([
				db.Listing.findById(listingId, { Featured: 0, Archived: 0 }),
				db.Image.find({ listingId })
		    ]);

		    respond.handleJSONResponse(response, { listing, listingImages })
		} catch (error) {
		    respond.handleTextResponse(response, "fail");
		}
    });
}

async function updateListing(request, response) {
	try {
		const [fields, files, imageNamesAndPositions] = await new FormDataHandler(request).run();
		fields['Location'] = {
			coordinates: [ fields.Longitude, fields.Latitude ]
		};
	
		if (files.length) {
			const metadata = await saveImagesToCloud(files);
			await saveImagesToDB(fields.id, metadata, imageNamesAndPositions);
		}
		await updateExistingFiles(fields.fileId)
		await db.Listing.updateOne({ _id: fields.id}, fields);
		await serverRender.renderListingRelatedPages(fields.id, fields.Heading, fields.Mandate);
		await deleteFilterPages()
	
		respond.handleTextResponse(response, "success");
	} catch (error) {
		console.log(error)
		respond.handleTextResponse(response, "fail");
	}
}

function updateExistingFiles(filedata) {
    if (filedata && filedata.length) {
		return Promise.all(filedata.map(data => {
		    return new Promise((resolve, reject) => {
				const dataObj = qs.parse(data);
				db.Image.updateOne(
				    { _id: dataObj.name },
				    { position: dataObj.position},
				    (error, result) => {
						if (error) console.log(`${filename} not exist`);
						console.log("Updated existing images")
						resolve(result)
				    })
		    })
		}))
    } else {
		return ;
    }
}
   
exports.retrieveListing = retrieveListing;
exports.updateListing = updateListing;