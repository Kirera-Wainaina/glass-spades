const fs = require("fs");
const path = require("path");

const Busboy = require("busboy");
const dotenv = require("dotenv");
dotenv.config()

function uploadSitemap(request, response) {
    const busboy = new Busboy({ headers: request.headers });

    busboy.on("file", (name, file) => {
	// const filePath = path.join(__dirname, "xyx");
	// console.log(process.env.SITEMAP)
	file.pipe(fs.createWriteStream(process.env.SITEMAP))
	    .on("error", error => console.log(error))
    })

    busboy.on("close", () => {
	console.log("done")
    })

    request.pipe(busboy);
}

exports.uploadSitemap = uploadSitemap;
