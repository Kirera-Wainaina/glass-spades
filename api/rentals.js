const utils = require("../utils/general");

function getRentals(request, response) {
    utils.getListings(request, response);
}

exports.getRentals = getRentals;
