const db = require("../../database/models");
const FormDataHandler = require('../../utils/formDataHandler');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv');
const { minifyImage, saveImage, deleteImageFromCloud } = require("../../utils/images");
dotenv.config()

exports.retrieveAuthor = async function (request, response) {
  try {
    const parsed_url = new URL(request.url, process.env.URL);
    const id = parsed_url.searchParams.get("id");
    const author = await db.Author.findById(id);
    response.writeHead(200, {"content-type": "application/json"});
    response.end(JSON.stringify(author));
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}

exports.updateAuthor = async function (request, response) {
  try {
    const [fields, files] = await new FormDataHandler(request).run();
    const result = await bcrypt.compare(fields.adminPassword, process.env.ENCRYPTED_ADMIN_PASSWORD);

    if (result) {
      // admin password is verified
      if (files.length) {
        console.log(files, fields);
        const [convertedFileMetadata] = await minifyImage(files[0]);
        const cloudFile = await saveImage(convertedFileMetadata.destinationPath);
        const [cloudMetadata] = await cloudFile.getMetadata();

        await db.Author.findByIdAndUpdate(fields.id, {
          ...fields,
          profileImageLink: cloudMetadata.mediaLink,
          profileImageName: cloudMetadata.name
        })
        response.writeHead(200, {"content-type": "text/plain"})
        response.end("success");
      } else {
        await db.Author.findByIdAndUpdate(fields.id, fields);
        response.writeHead(200, {"content-type": "text/plain"});
        response.end("success");
      }
    } else {
      response.writeHead(401, {'content-type': "text/plain"});
      response.end("forbidden-error");
    }
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}

exports.deleteAuthor = async function (request, response) {
  try {
    const [fields] = await new FormDataHandler(request).run();
    const result = await bcrypt.compare(fields.adminPassword, process.env.ENCRYPTED_ADMIN_PASSWORD);

    if (result) {
      const docs = await db.Author.findById(fields.id);
      await deleteImageFromCloud(docs.profileImageName);
      await db.Author.findByIdAndDelete(docs._id);
      console.log("successfully deleted author");
      response.writeHead(200, {"content-type": "text/plain"});
      response.end("success");
    } else {
      response.writeHead(401, {'content-type': "text/plain"});
      response.end("forbidden-error");
    }
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}