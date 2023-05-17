const busboy = require('busboy');
const mimes = require('./MIMETypes');
const path = require('path');
const fs = require('fs');
const qs = require('querystring');

class FormDataHandler {
    constructor(request) {
        this.request = request;
        this.fields = {};
        this.uploadedFiles = [];
        this.thereIsFile = false;
        this.fileNumber = 0;
        this.imageNamesAndPositions = []
    }

    retrieveDetails() {
        return new Promise((resolve, reject) => {
            const bus = busboy({ headers: this.request.headers });
            bus.on('field', (name, value) => this.handleField(name, value));
            bus.on('file', 
                    (name, file, info) => this.handleFile(name, file, info, resolve));
            bus.on('close', () => this.handleClose(resolve))
            
            this.request.pipe(bus);

        })
    }

    handleField(name, value) {
        if (
			name == "External Features" || 
			name == "Internal Features" ||
		    name == "fileId"
		) {
		    if (this.fields[name]) {
				this.fields[name].push(value);
		    } else {
				this.fields[name] = [value];
		    }
		} else {
		    this.fields[name] = value;
		}
    }

    handleFile(name, file, info, resolve) {
        const imageInfo = qs.parse(name);
        this.imageNamesAndPositions.push(imageInfo);
        const fileName = imageInfo.name ?? name;
        this.thereIsFile = true;
        const ext = mimes.findExtensionFromMIMEType(info.mimeType);
        const filePath = path.join(__dirname, '..', 'uploaded', `${fileName}${ext}`);

        file.pipe(fs.createWriteStream(filePath))
            .on('finish', () => this.handleFileSaved(name, filePath, resolve))
    }

    handleClose(resolve) {
        console.log('Data retrieved successfully');
        if (this.thereIsFile) {
            if (!this.fields.fileNumber) throw new Error('fileNumber field not uploaded');
        } else {
            resolve()
        }
    }

    handleFileSaved(name, filePath, resolve) {
        console.log(`${name} written to disk`);
        this.fileNumber += 1;
        this.uploadedFiles.push(filePath);
        if (this.fileNumber == Number(this.fields.fileNumber)) resolve()
    }

    run() {
        return new Promise((resolve, reject) => {
            this.retrieveDetails()
                .then(() => resolve([
                    this.fields, 
                    this.uploadedFiles, 
                    this.imageNamesAndPositions
                ]))
                .catch(error => reject(error))
        })
    }
}

module.exports = FormDataHandler;