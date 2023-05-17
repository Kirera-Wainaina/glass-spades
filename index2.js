const http2 = require("http2");
const http = require("http");
const path = require("path");
const fs = require("fs");

const indexUtils = require("./index-utils.js");

const dotenv = require("dotenv");
dotenv.config();

const httpPort = 80;
const port = 443;

const options = {
    key: fs.readFileSync(`${process.env.CERTPATH}/privkey.pem`, "utf8"),
    cert: fs.readFileSync(`${process.env.CERTPATH}/fullchain.pem`, "utf8"),
    ca: fs.readFileSync(`${process.env.CERTPATH}/chain.pem`, "utf8"),
    allowHTTP1: true
};


const server = http2.createSecureServer(options);

server.on("request",
	(request, response) => console.log(
		`Date: ${new Date()}, Path: ${request.url} http: ${request.httpVersion}`
	)
)

server.on("request", async (request, response) => {
	const parsed_url = new URL(request.url, process.env.URL);
	console.log(parsed_url)
    const cwd = ".";

    if (request.url == "/") {
		const filePath = indexUtils.createFilePath(request.url);
		indexUtils.readFileAndRespond(filePath, response);
    } else if (indexUtils.findTopDir(request.url) == "/api"){
	// has to come before browser requests
	try {
	    const file = require(`${cwd}${path.dirname(parsed_url.pathname)}`);
	    const execute = path.basename(parsed_url.pathname);
	    file[execute](request, response);
	} catch(error) {
	    indexUtils.handleError(error, response);
	}
    } else if (!path.extname(parsed_url.pathname) ){
	// browser paths
	const filePath = indexUtils.createFilePath(request.url)
	indexUtils.readFileAndRespond(filePath, response);
    } else {
	const filePath = indexUtils.createFilePath(request.url);
	indexUtils.readFileAndRespond(filePath, response);
    }
});

server.listen(port, () => {
    console.log(`Listening on port ${port}`)
});

////////////////////////////////////////////////////////////////////////

const httpServer = http.createServer();

httpServer.on("request", (request, response) => {
    console.log("A request was received on HTTP server");
    response
	.writeHead(301, {
	    "location": `${process.env.URL}${request.url}`
	})
	.end();
    
});

httpServer.listen(httpPort, () =>
    console.log(`Http server listening on port ${httpPort}`));

httpServer.on("error", error => {
    console.log(error);
})