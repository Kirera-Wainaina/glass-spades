const db = require("../../database/models");
const { urlifySentence, renderAndSaveHTMLsToFiles } = require("../../utils/serverRender");
const dotenv = require("dotenv");
dotenv.config()

exports.renderListings = async function (request, response) {
  try {
    const listingUrls = await generateListingUrls();
    const allUrls = listingUrls.concat(createNonListingUrls());
    const groupedUrls = groupUrls(allUrls);

    for (const group of groupedUrls) {
      await renderAndSaveHTMLsToFiles(group);
    }
    response.writeHead(200, {"content-type": "text/plain"});
    response.end("success")
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error")
  }
}

async function generateListingUrls() {
  const listings = await db.Listing.find({ Archived: false }, { Heading: 1 });
  return listings.map(
    listing => `${process.env.URL}/listing/${urlifySentence(listing.Heading)}?id=${listing._id}`
  );
}

function createNonListingUrls() {
  return [
    `${process.env.URL}/sales`,
    `${process.env.URL}/rentals`,
    `${process.env.URL}/`
  ]
}

function groupUrls(urls) {
  const newArr = [];

  while (urls.length) {
    newArr.push(urls.splice(0, 5))
  }
  return newArr
}