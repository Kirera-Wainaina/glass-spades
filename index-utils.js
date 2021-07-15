const fs = require("fs")
const zlib = require("zlib");
const path = require("path");
const url = require("url");
const qs = require("querystring");

const MIMES = require("./utils/MIMETypes.js");

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


function createFilePath(urlPath) {
    const cwd = ".";
    const parsed_url = url.parse(urlPath);
    let filePath;

    if (urlPath == "/") {
	filePath = `${cwd}/frontend/html/home.html`;
    } else if (!path.extname(parsed_url.pathname) ){
	// browser paths
	filePath = `${cwd}/frontend/html${parsed_url.pathname}.html`;
    } else {
	// etc files e.g favicon
	filePath = `${cwd}${parsed_url.pathname}`;
    }

    return filePath
}

exports.readFileAndRespond = readFileAndRespond;
exports.createFilePath = createFilePath;
exports.handleError = handleError;
exports.findTopDir = findTopDir;
