const fs = require("fs");
const fsPromises = require('fs/promises');
const path = require("path");

const dotenv = require("dotenv");

const respond = require("../../utils/respond.js");
const FormDataHandler = require("../../utils/formDataHandler.js");

dotenv.config()

exports.uploadSitemap = async function (request, response) {
    try {
        const [fields, files] = await new FormDataHandler(request).run();
        const sitemapPath = path.join(__dirname, '..', '..', "sitemap.xml");
        fs.createReadStream(files[0])
            .pipe(fs.createWriteStream(sitemapPath))
            .on("finish", async () => {
                await fsPromises.unlink(files[0]);
            	respond.handleTextResponse(response, "success");
            })
    } catch (error) {
        console.log(error);
        response.writeHead(500, { "content-type": "text/plain"});
        response.end("server-error");
    }
}
