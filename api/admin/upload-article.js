const db = require("../../database/models");

exports.getAuthorNames = async function (request, response) {
  try {
    const docs = await db.Author.find({}, {
      authorName: 1
    })
    response.writeHead(200, {"content-type": "application/json"});
    response.end(JSON.stringify(docs));
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text-plain"});
    response.end("server-error");
  }
}