const dotenv = require("dotenv");
const db = require("../database/models");

dotenv.config();

exports.fetchRelatedArticleData = function (request, response) {
  try {
    const parsed_url = new URL(request.url, process.env.URL);
    
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error")
  }
}

exports.fetchAuthor = async function (request, response) {
  try {
    const parsed_url = new URL(request.url, process.env.URL);
    const authorId = parsed_url.searchParams.get("id");
    const docs = await db.Author.findById(authorId);
    response.writeHead(200, {"content-type": "application/json"});
    response.end(JSON.stringify(docs));
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error")
  }
}