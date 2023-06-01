const FormDataHandler = require("../../utils/formDataHandler");

async function uploadImages(request, response) {
  const [fields, files] = await new FormDataHandler(request).run();
  console.log(files);
}

exports.uploadImages = uploadImages;