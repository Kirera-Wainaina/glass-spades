const utils = require("../utils/general");

function getSales(request, response) {
    utils.getListings(request, response)
}

exports.getSales = getSales;