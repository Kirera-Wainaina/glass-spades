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
	    console.log(error)
	    handleError(error, response)
	} else {
	    const mime = MIMES.findMIMETypeFromExtension(path.extname(filePath));

	    if (mime.split("/")[0] == "image") {
		// images should not be compressed
		response.writeHead(statusCode || 200, {
		    "content-type": mime,
		    "cache-control": "max-age=604800"
		})

		fs.createReadStream(filePath)
		    .pipe(response)
	    } else {
		response.writeHead(statusCode || 200, {
		    "content-type": mime,
		    "content-encoding": "gzip",
		    // "cache-control": "max-age=86400"
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
	const filePath = path.join(__dirname, "frontend/html/error.html")
	const errorCode = 404;
	readFileAndRespond(filePath, response, errorCode)
    } else {
	console.log(error);
	const filePath = path.join(__dirname, "frontend/html/error.html")
	const errorCode = 404;
	readFileAndRespond(filePath, response, errorCode)
    }
}

function findTopDir(route) {
	const reg = /^\/.+?(?=\/.+)/;
	const match = route.match(reg);
	return match ? match[0] : match
}


function createFilePath(urlPath) {
    const cwd = ".";
    const parsed_url = url.parse(urlPath);
    let filePath;

    if (parsed_url.pathname == "/") {
	filePath = path.join(__dirname, "frontend/html/home.html")
    } else if (!path.extname(parsed_url.pathname) ){
	// browser paths
	const dir = path.basename(path.dirname(parsed_url.pathname));
	// check for listing page and serve listing html file
	filePath = path.join(__dirname, `frontend/html/${dir == "listing" ? "/listing" : parsed_url.pathname}.html`)
    } else {
	// etc files e.g favicon
	filePath = path.join(__dirname, parsed_url.pathname);
    }

    return filePath
}

exports.readFileAndRespond = readFileAndRespond;
exports.createFilePath = createFilePath;
exports.handleError = handleError;
exports.findTopDir = findTopDir;
exports.routeCache = new Map();
