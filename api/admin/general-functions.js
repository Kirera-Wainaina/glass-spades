const fs = require("fs");
const path = require("path");

const Busboy = require("busboy");
const dotenv = require("dotenv");

const respond = require("../../utils/respond.js");
const indexUtils = require("../../index-utils");
dotenv.config()

function uploadSitemap(request, response) {
    const busboy = new Busboy({ headers: request.headers });

    busboy.on("file", (name, file) => {
	file.pipe(fs.createWriteStream(process.env.SITEMAP))
	    .on("error", error => console.log(error))
    })

    busboy.on("finish", () => {
	indexUtils.routeCache.delete(`/sitemap.xml`)
	respond.handleTextResponse(response, "success");
    })

    request.pipe(busboy);
}

exports.uploadSitemap = uploadSitemap;
