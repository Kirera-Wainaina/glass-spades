const db = require("../database/models");
const dotenv = require("dotenv");

dotenv.config();

exports.retrieveArticle = async function (request, response) {
  try {
    const parsed_url = new URL(request.url, process.env.URL);
    const docs = await db.Article.find(
      {
        _id: parsed_url.searchParams.get("id"),
        urlTitle: parsed_url.searchParams.get("urlTitle")
      },
      {
        content: 1,
        description: 1,
        landscapeImage: 1,
        landscapeImageText: 1,
        portraitImage: 1,
        portraitImageText: 1,
        publishedDate: 1,
        updatedDate:1 ,
        title: 1,
        relatedArticle1: 1,
        relatedArticle2: 1,
        authorId: 1
      }
    )
    response.writeHead(200, {"content-type": "application/json"});
    response.end(JSON.stringify(docs));
  } catch (error) {
    console.log("error");
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error")
  }
}

exports.retrieveAuthorNameAndURL = async function (request, response) {
  try {
    const parsed_url = new URL(request.url, process.env.URL);
    const docs = await db.Author.findById(parsed_url.searchParams.get("id"));
    response.writeHead(200, {"content-type": "application/json"});
    response.end(JSON.stringify(docs));
  } catch (error) {
    console.log("error");
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error")
  }
}