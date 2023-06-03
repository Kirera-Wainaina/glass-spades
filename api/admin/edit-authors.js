const db = require('../../database/models');

exports.getAuthors = async function (request, response) {
  try {
    const data = await db.Author.find({}).select({
      profileImageLink: 1,
      authorName: 1
    })
    response.writeHead(200, {"content-type": "application/json"})
    response.end(JSON.stringify(data));
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/html"})
    response.end("server-error");
  }
}