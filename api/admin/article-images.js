const FormDataHandler = require("../../utils/formDataHandler");
const { minifyImage, saveImage } = require("../../utils/images");

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
  console.log(cloudMetadata);
}

exports.uploadImages = uploadImages;