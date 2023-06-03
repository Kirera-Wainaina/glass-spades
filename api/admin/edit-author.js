const db = require("../../database/models");

exports.retrieveAuthor = async function (request, response) {
  try {
    const parsed_url = new URL(request.url, process.env.URL);
    const id = parsed_url.searchParams.get("id");
    const author = await db.Author.findById(id);
    response.writeHead(200, {"content-type": "application/json"});
    response.end(JSON.stringify(author));
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}