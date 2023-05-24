const utils = require("../utils/general");
const dotenv = require('dotenv');
const fsPromises = require('fs/promises');
const path = require('path');
dotenv.config();

function getSales(request, response) {
    handleFilterUrls(request)
    utils.getListings(request, response)
}

async function handleFilterUrls(request) {
    const parsedUrl = new URL(request.url, process.env.URL);
    console.log(parsedUrl)
    if (parsedUrl.search) {
        // check if it's a filter url
        // check if rendered page exists in static file
        // if not, trigger rendering
        // if it does, simply return
        const fileName = parsedUrl.search.replace('?', '');
        const filePath = path.join(__dirname, '..', 'static', 'sales-filters', fileName);
        if (await fileExists(filePath)) {
            return ;
        } else {
            // render page
        }
    }
    
}

async function fileExists(filePath) {
    let fileExists = null;
    await fsPromises.open(filePath)
        .then(fileHandle => {
            if (fileHandle) fileExists = true;
        })
        .catch(error => {
            if (error.code == 'ENOENT') {
                fileExists = false;
            }
        });
    return fileExists
}

exports.getSales = getSales;
