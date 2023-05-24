const utils = require("../utils/general");
const dotenv = require('dotenv');
dotenv.config();

function getSales(request, response) {
    handleFilterUrls(request)
    utils.getListings(request, response)
}

function handleFilterUrls(request) {
    const parsedUrl = new URL(request.url, process.env.URL);
    console.log(parsedUrl)
    if (parsedUrl.search) {
        // check if it's a filter url
        // check if rendered page exists in static file
        // if not, trigger rendering
        // if it does, simply return
    }
    
}

exports.getSales = getSales;
