const path = require("path");
const fs = require("fs");

const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");
const { Storage } = require("@google-cloud/storage");

function minifyImage(filename) {
    const destination = path.join(path.dirname(__dirname), "converted");
    return imagemin(
	[filename],
	{
	    destination,
	    plugins: [imageminWebp({
		quality: 70,
	    })]
	}
    );
}

function saveImage(filepath) {
    const storage = new Storage();
    const bucket = storage.bucket("glass-spades-images");
    const filename = path.basename(filepath)

    const file = bucket.file(filename);
    fs.createReadStream(filepath)
	.pipe(file.createWriteStream())
	.on("error", error => console.log(error))
	.on("finish", () => console.log("Finished uploading to google"))
}

exports.minifyImage = minifyImage;
exports.saveImage = saveImage;
