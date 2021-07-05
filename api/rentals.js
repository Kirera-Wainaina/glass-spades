const db = require("../database/models");

async function getRentals(request, response) {
    const rentals = await db.Listing.find({ Mandate: "Rent" },
					  {
					      Heading: 1,
					      Price: 1,
					      Bedrooms: 1,
					      Bathrooms: 1
					  });
    
    console.log(rentals)
}

exports.getRentals = getRentals;
