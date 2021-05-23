const path = require("path");

const imagemin = require("imagemin");
const imageminWebp = require("imagemin-webp");

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

exports.minifyImage = minifyImage;
