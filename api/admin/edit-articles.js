const db = require("../../database/models")

exports.retrieveArticleData = async function (request, response) {
  try {
    const docs = await db.Article.find({}, 
      {
      title: 1,
      description: 1,
      landscapeImage: 1,
      publishedDate: 1,
      urlTitle: 1,
      }
    ).sort({ publishedDate: "desc" })
    
    response.writeHead(200, { "content-type": "application/json"});
    response.end(JSON.stringify(docs));
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}