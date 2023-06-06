const dotenv = require("dotenv");
const db = require("../../database/models");

dotenv.config();

exports.retrieveArticle = async function (request, response) {
  try {
    const parsed_url = new URL(request.url, process.env.URL);
    const docs = await db.Article.find({
      urlTitle: parsed_url.searchParams.get("urlTitle"),
      _id: parsed_url.searchParams.get("id")
    });
    response.writeHead(200, {"content-type": "application/json"});
    response.end(JSON.stringify(docs));
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}