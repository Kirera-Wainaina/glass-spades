function handleTextResponse(text, response) {
    response.writeHead(200, { "content-type": "text/plain"})
	.end(text)
}

exports.handleTextResponse = handleTextResponse;
