const path = require("path");
const fs = require("fs");

const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");
const { Storage } = require("@google-cloud/storage");
const dotenv = require('dotenv');
dotenv.config()

const storage = new Storage({
	keyFilename: process.env.SERVICE_ACCOUNT_PATH
});

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
    const bucket = storage.bucket("glass-spades-images");
    const filename = path.basename(filepath)
    const file = bucket.file(filename);
    // The options will prevent a socket hangup error
    // The error occurs when uploading a lot of files at the same time
    const gcsStream = file.createWriteStream({ 
			resumable: false,
			validation: false 
		});

    return new Promise((resolve, reject) => {
			fs.createReadStream(filepath)
	    // .pipe(file.createWriteStream())
	    .pipe(gcsStream)
	    .on("error", error => reject(error))
	    .on("finish", () => {
				console.log("Finished uploading to google")
				resolve(file)
	    })
    })
}

function getFileMetadata(name) {
    const bucket = storage.bucket("glass-spades-images");
    const filename = path.basename(name);
    const file = bucket.file(filename);
    return file.getMetadata()
}

function deleteImageFromCloud(name) {
    return new Promise((resolve, reject) => {
		const bucket = storage.bucket("glass-spades-images");
		const file = bucket.file(name);
		file.delete((error, apiResponse) => {
		    if (error) reject(error);
		    resolve(apiResponse)
		});
    })
}

exports.minifyImage = minifyImage;
exports.saveImage = saveImage;
exports.getFileMetadata = getFileMetadata;
exports.deleteImageFromCloud = deleteImageFromCloud;
