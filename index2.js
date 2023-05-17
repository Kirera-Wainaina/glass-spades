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
	// only headless chromium should access this to generate static files
	if (request.headers['user-agent'] != 'glassspades-headless-chromium') return;

	const parsed_url = new URL(request.url, process.env.URL);
	const pathname = parsed_url.pathname;

    if (pathname == "/") {
		const filePath = indexUtils.createFilePath(pathname);
		indexUtils.readFileAndRespond(filePath, response);
    } else if (indexUtils.findTopDir(pathname) == "/api"){
		// has to come before browser requests
		handleAPIRoute(request, response);
    } else if (!path.extname(parsed_url.pathname) ){
		// browser paths
		const filePath = indexUtils.createFilePath(request.url)
		indexUtils.readFileAndRespond(filePath, response);
    } else {
		const filePath = indexUtils.createFilePath(request.url);
		indexUtils.readFileAndRespond(filePath, response);
    }
});

server.on('request', (request, response) => {
	// headless chromium should be able to access the rest of the code
	if (request.headers['user-agent'] == 'glassspades-headless-chromium') return;

})

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

/////////////////////////////////////////////////////////////////////////

function handleAPIRoute(request, response) {
	try {
		const parsed_url = new URL(request.url, process.env.URL);
		const pathname = parsed_url.pathname;
		const cwd = '.';
	    const file = require(`${cwd}${path.dirname(pathname)}`);
		const execute = path.basename(pathname);

	    file[execute](request, response);
	} catch (error) {
	    indexUtils.handleError(error, response);
	}
}