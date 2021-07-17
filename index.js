const http2 = require("http2");
const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const url = require("url");
const qs = require("querystring");

const dotenv = require("dotenv");
const puppeteer = require("puppeteer");
const MIMES = require("./utils/MIMETypes.js");
const indexUtils = require("./index-utils.js");
let wsEndpoint, routeCache;

dotenv.config()

// const httpPort = process.env.HTTP_PORT;
// const port = process.env.PORT;
const httpPort = 80;
const port = 443;

const options = {
    key: fs.readFileSync(`${process.env.CERTPATH}/privkey.pem`, "utf8"),
    cert: fs.readFileSync(`${process.env.CERTPATH}/fullchain.pem`, "utf8"),
    ca: fs.readFileSync(`${process.env.CERTPATH}/chain.pem`, "utf8"),
    allowHTTP1: true
};


const server = http2.createSecureServer(options);

server.on("request", async (request, response) => {
    console.log(`Date: ${new Date()}, Path: ${request.url} http: ${request.httpVersion}`)
    const parsed_url = url.parse(request.url);
    const cwd = ".";

    if (request.url == "/") {
	serverSideRender(request, response);
    } else if (indexUtils.findTopDir(request.url) == "/api"){
	// has to come before browser requests
	try {
	    const file = require(`${cwd}${path.dirname(request.url)}`);
	    const execute = path.basename(request.url);
	    file[execute](request, response);
	} catch(error) {
	    handleError(error, response);
	}
    } else if (!path.extname(parsed_url.pathname) ){
	// browser paths
	serverSideRender(request, response);
    } else {
	const filePath = indexUtils.createFilePath(request.url);
	indexUtils.readFileAndRespond(filePath, response);
    }
});

server.on("listening", async () => {
    const browser = await puppeteer
 	.launch({ args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    wsEndpoint = browser.wsEndpoint();
    routeCache = new Map();
})

server.listen(port, () => console.log(`Listening on port ${port}`));

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



async function serverSideRender(request, response) {
    const parsed_url = url.parse(request.url);
    const cwd = "."
    if (routeCache.has(parsed_url.pathname)) {
	response.writeHead(200, { "content-type": "text/html" })
	    .end(routeCache.get(parsed_url.path))
    } else {
	if (request.headers["user-agent"] == "glassspades-headless-chromium") {
   	    const filePath = indexUtils.createFilePath(request.url);
	    indexUtils.readFileAndRespond(filePath, response)
	} else {
	    const browser = await puppeteer.connect({ browserWSEndpoint: wsEndpoint });
	    const page = await browser.newPage();
	    await page.setUserAgent("glassspades-headless-chromium")
	    await page.goto(`${process.env.URL}${request.url}`,
			    { waitUntil: "networkidle0" });
	    const html = await page.content();
	    routeCache.set(parsed_url.path, html);
	    response.writeHead(200, {
		"content-type": "text/html"
	    })
		.end(html)
	}
    }
}
