const db = require("../database/models");
const dotenv = require("dotenv");

dotenv.config();

exports.getArticles = async function (request, response) {
  try {
    const parsed_url = new URL(request.url, process.env.URL);
    const docs = await db.Article.find({}, 
      {
        title: 1,
        description: 1,
        landscapeImage: 1,
        landscapeImageText: 1,
        publishedDate: 1,
        updatedDate: 1,
        urlTitle: 1,
      })
      .sort({ publishedDate: "desc" })
      .limit(Number(parsed_url.searchParams.get("limit")))
      .skip(Number(parsed_url.searchParams.get("offset")));
      console.log(docs)
    
    response.writeHead(200, { "content-type": "application/json"});
    response.end(JSON.stringify(docs));
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}

exports.countArticles = async function (request, response) {
  try {
    const count = await db.Article.estimatedDocumentCount();
    response.writeHead(200, { "content-type": "application/json"});
    response.end(JSON.stringify(count));

  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}