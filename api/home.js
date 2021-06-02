const db = require("../database/models");

async function getListings(request, response) {
    const overviews = await db.Image.find({ name: /-0.webp/ })
    console.log(overviews)
}

exports.getListings = getListings;
