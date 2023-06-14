exports.renderListings = async function (request, response) {
  try {
    
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error")
  }
}