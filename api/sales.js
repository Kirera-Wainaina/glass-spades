const utils = require("../utils/general");

async function getSales(request, response) {
    utils.getListings(request, response)
}

exports.getSales = getSales;
