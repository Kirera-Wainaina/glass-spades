const FormDataHandler = require("../../utils/formDataHandler");
const { minifyImage, saveImage } = require("../../utils/images");
const db = require('../../database/models');
const fsPromises = require('fs/promises')

async function uploadImages(request, response) {
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
}

exports.uploadImages = uploadImages;