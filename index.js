const http2 = require("http2");
const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const dotenv = require("dotenv");
const MIMES = require("./utils/MIMETypes.js");

dotenv.config()

const httpPort = 80;
const port = 443;

const options = {
    key: fs.readFileSync(`${process.env.CERTPATH}/privkey.pem`, "utf8"),
    cert: fs.readFileSync(`${process.env.CERTPATH}/fullchain.pem`, "utf8"),
    ca: fs.readFileSync(`${process.env.CERTPATH}/chain.pem`, "utf8"),
    allowHTTP1: true
};

const server = http2.createSecureServer(options);

server.on("request", (request, response) => {
    console.log(`Date: ${new Date()}, Path: ${request.url} http: ${request.httpVersion}`)
    const url = request.url;
    const cwd = ".";

    if (url == "/") {
	const filePath = `${cwd}/frontend/html/home.html`;
	readFileAndRespond(filePath, response)
    } else if(!path.extname(url)) {
	const filePath = `${cwd}/frontend/html${url}.html`;
	readFileAndRespond(filePath, response)
    } else {
	const filePath = `${cwd}${url}`;
	readFileAndRespond(filePath, response);
    }
});

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


//////////////////////////////////////////////////////////////////////////

function readFileAndRespond(filePath, response, statusCode=null) {
    fs.stat(filePath, (error, stats) => {
	if (error) {
	    handleError(error, response)
	} else {
	    const mime = MIMES.findMIMETypeFromExtension(path.extname(filePath));

	    response.writeHead(statusCode || 200, {
		"content-type": mime,
		"content-encoding": "gzip"
	    });
	    
	    fs.createReadStream(filePath)
		.pipe(zlib.createGzip())
		.pipe(response)
	}
    })
    
}

function handleError(error, response) {
    if (error.code == "ENOENT") {
	const filePath = "./frontend/html/error.html";
	const errorCode = 404;
	readFileAndRespond(filePath, response, errorCode)
    } else {
	console.log(error);
    }
}
