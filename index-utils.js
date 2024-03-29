const fs = require("fs")
const zlib = require("zlib");
const path = require("path");
const fsPromises = require("fs/promises");

const MIMES = require("./utils/MIMETypes.js");
const { renderPage } = require("./utils/serverRender.js");

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
				    "cache-control": "max-age=2419200"
				})
			
				fs.createReadStream(filePath)
				    .pipe(response)
		  } else {
				response.writeHead(statusCode || 200, {
				    "content-type": mime,
				    "content-encoding": "gzip",
				    "cache-control": "max-age=1209600"
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
	const parsed_url = new URL(urlPath, process.env.URL);
  let filePath;
  if (parsed_url.pathname == "/") {
		filePath = path.join(__dirname, "frontend/html/home.html")
  } else if (!path.extname(parsed_url.pathname) ){
		// browser paths
		const dir = path.basename(path.dirname(parsed_url.pathname));
		// check for listing or article page and serve their html file
		if (dir == "listing" || dir == "article") {
			filePath = path.join(__dirname, `frontend/html/${dir}.html`);
		} else {
			filePath = path.join(__dirname, `frontend/html${parsed_url.pathname}.html`)
		}
  } else {
		// etc files e.g favicon
		filePath = path.join(__dirname, parsed_url.pathname);
  }
	
	return filePath
}

async function createStaticFilePath(urlPath) {
	const parsed_url = new URL(urlPath, process.env.URL);
	const pathname = parsed_url.pathname;
	const dir = path.basename(path.dirname(parsed_url.pathname));
	let filePath;

	if (pathname == '/') {
		filePath = path.join(__dirname, "static/home.html");
	} else if (pathname == '/rentals' || pathname == '/sales') {
		if (parsed_url.searchParams.toString()) {
			// search params means someone is filtering so check if file is rendered
			filePath = await handleFilterPage(parsed_url);
		} else {
			filePath = path.join(__dirname, `static${pathname}.html`);
		}
	} else if (pathname == "/articles") {
		// it's an article list
		let page = parsed_url.searchParams.get("page");
		if (!page) page = 1;
		filePath = path.join(__dirname, `static/article-lists/${page}.html`);
	} else if (dir == 'listing' || dir == "article") {
		const id = parsed_url.searchParams.get('id');
		filePath = path.join(__dirname, `static/${dir}s/${id}.html`)
	} else if (!path.extname(pathname)) {
		// other browser paths
		filePath = path.join(__dirname, `frontend/html/${pathname}.html`);
	} else {
		// etc files e.g favicon.ico, /frontend/js/home.js
		filePath = path.join(__dirname, parsed_url.pathname);
	}
	return filePath
}

async function fileExists(filePath) {
    let fileExists = null;
    await fsPromises.open(filePath)
      .then(fileHandle => {
          if (fileHandle) fileExists = true;
          fileHandle.close();
      })
      .catch(error => {
          if (error.code == 'ENOENT') {
              fileExists = false;
          }
      });
    return fileExists
}

async function handleFilterPage(parsed_url) {
	const pathname = parsed_url.pathname;
	const fileName = parsed_url.search.replace('?', '');
	const parentDir = pathname == '/rentals' ? "rentals-filters" : "sales-filters";
	filePath = path.join(__dirname, 'static', parentDir, `${fileName}.html`);
	const fileExistsResult = await fileExists(filePath);
	if (!fileExistsResult) {
		const { content } = await renderPage(parsed_url.href);
		await fsPromises.writeFile(filePath, content);
	}
	return filePath
}

exports.readFileAndRespond = readFileAndRespond;
exports.createFilePath = createFilePath;
exports.createStaticFilePath = createStaticFilePath;
exports.handleError = handleError;
exports.findTopDir = findTopDir;