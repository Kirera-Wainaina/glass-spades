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
    const cacheUrl = createCacheUrl(request)
    if (routeCache.has(cacheUrl)) {
	response.writeHead(200, { "content-type": "text/html",
				  "cache-control": "max-age=86400"
				})
	    .end(routeCache.get(cacheUrl))
    } else {
	if (request.headers["user-agent"] == "glassspades-headless-chromium") {
   	    const filePath = indexUtils.createFilePath(request.url);
	    indexUtils.readFileAndRespond(filePath, response)
	} else {
	    const browser = await puppeteer.connect({
		browserWSEndpoint: wsEndpoint });
	    const page = await browser.newPage();
	    await page.setUserAgent("glassspades-headless-chromium")
	    await page.setRequestInterception(true);
	    page.on("request", req => {
		// anything request not on the allow list is not useful to the dom
		const allowList = ["document", "script", "xhr"];

		if (!allowList.includes(req.resourceType())) {
		    return req.abort();
		}

		req.continue();
	    })

	    await page.goto(`${process.env.URL}${request.url}`,
			    { waitUntil: "networkidle0" });
	    const html = await page.content();
	    await page.close();
	    routeCache.set(cacheUrl, html);
	    response.writeHead(200, {
		"content-type": "text/html",
		"cache-control": "max-age=86400"
	    })
		.end(html)
	}
    }
}

function createCacheUrl(request) {
    let cacheUrl;
    const parsed_url = url.parse(request.url);
    const filePath = indexUtils.createFilePath(request.url);
    const fileExists = fs.existsSync(filePath);

    if (fileExists) {
	if (parsed_url.pathname == "/listing") {
	    const query = qs.parse(parsed_url.query);
	    const id = query.id;
	    cacheUrl = `${parsed_url.pathname}-{id}`;
	} else {
	    cacheUrl = parsed_url.pathname;
	}
    } else {
	// to prevent error page from being saved multiple times under
	// different names
	cacheUrl = "error";
    }
    return cacheUrl
}
