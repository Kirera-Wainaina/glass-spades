function handleTextResponse(response, text) {
    response.writeHead(200, { "content-type": "text/plain"})
	.end(text)
}

function handleJSONResponse(response, data) {
    response.writeHead(200, { "content-type": "application/json" })
	.end(JSON.stringify(data));
}

exports.handleTextResponse = handleTextResponse;
exports.handleJSONResponse = handleJSONResponse;
