const http2 = require("http2");
const http = require("http");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const url = require("url");
const qs = require("querystring");

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
    // const url = request.url;
    const parsed_url = url.parse(request.url);
    const cwd = ".";

    if (url == "/") {
	const filePath = `${cwd}/frontend/html/home.html`;
	readFileAndRespond(filePath, response)
    } else if (findTopDir(request.url) == "/api"){
	// has to come before browser requests
	try {
	    const file = require(`${cwd}${path.dirname(request.url)}`);
	    const execute = path.basename(request.url);
	    file[execute](request, response);
	} catch(error) {
	    handleError(error, response);
	}
    } else if(!path.extname(parsed_url.pathname)) {
	let filePath;
	if (parsed_url.query) {
	    filePath = `${cwd}/frontend/html${parsed_url.pathname}.html`;
	} else {
	    filePath = `${cwd}/frontend/html${request.url}.html`;
	}
	readFileAndRespond(filePath, response)

    } else {
	const filePath = `${cwd}${request.url}`;
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

	    if (mime.split("/")[0] == "image") {
		// images should not be compressed
		response.writeHead(statusCode || 200, {
		    "content-type": mime
		})

		fs.createReadStream(filePath)
		    .pipe(response)
	    } else {
		response.writeHead(statusCode || 200, {
		    "content-type": mime,
		    "content-encoding": "gzip"
		})
		
		fs.createReadStream(filePath)
		    .pipe(zlib.createGzip())
		    .pipe(response)
	    }

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
	const filePath = "./frontend/html/error.html";
	const errorCode = 404;
	readFileAndRespond(filePath, response, errorCode)
    }
}


function findTopDir(route) {
    let dir = route;
    let top;
    while (dir != "/") {
	if (path.dirname(dir) == "/") {
	    top = dir;
	}
	dir = path.dirname(dir);
    }
    return top
}
