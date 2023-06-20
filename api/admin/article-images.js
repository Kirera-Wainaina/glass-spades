const FormDataHandler = require("../../utils/formDataHandler");
const { minifyImage, saveImage, deleteImageFromCloud } = require("../../utils/images");
const db = require('../../database/models');
const fsPromises = require('fs/promises');
const { handleTextResponse } = require("../../utils/respond");

async function uploadImages(request, response) {
  try {
    const [fields, files] = await new FormDataHandler(request).run();

    const convertedFileMetadata = await Promise.all(
      files.map(filePath => minifyImage(filePath))
    ).then(data => data.flat());

    const cloudFiles = await Promise.all(
      convertedFileMetadata.map(metadata => saveImage(metadata.destinationPath))
    )
    
    const cloudMetadata = await Promise.all(
      cloudFiles.map(file => {
        return file.getMetadata()
          .then(data => data[0])
      })
    );

    const dataToSave = cloudMetadata.map(metadata => ({
      createTime: Date.now(),
      link: metadata.mediaLink,
      name: metadata.name
    }))

    await db.ArticleImage.insertMany(dataToSave);

    const filePaths = convertedFileMetadata.flatMap(
      metadata => [metadata.sourcePath, metadata.destinationPath]
    );
    await Promise.all(filePaths.map(filePath => fsPromises.unlink(filePath)));

    handleTextResponse(response, 'success')
  } catch (error) {
    console.log(error);
    response.writeHead(500, { 'content-type': 'text/plain'});
    response.end('error');
  }
  
}

async function retrieveUploadedImages(request, response) {
  try {
    const data = await db.ArticleImage.find({}).sort({ createTime: "desc" })
    response.writeHead(200, {'content-type': 'application/json'});
    response.end(JSON.stringify(data))
  } catch (error) {
    console.log(error);
    response.writeHead(500, { 'content-type': 'text/plain'});
    response.end('error');
  }
}

async function deleteImages(request, response) {
  try {
    const [fields, files] = await new FormDataHandler(request).run();
    const imageNames = fields.imageNames;

    await Promise.all(imageNames.map(name => deleteImageFromCloud(name)));
    await Promise.all(imageNames.map(name => db.ArticleImage.deleteOne({ name })));

    console.log('successfully deleted images');
    handleTextResponse(response, 'success')
  } catch (error) {
    console.log(error);
    response.writeHead(500, { 'content-type': 'text/plain'});
    response.end('error');
  }
}

exports.uploadImages = uploadImages;
exports.retrieveUploadedImages = retrieveUploadedImages;
exports.deleteImages = deleteImages;