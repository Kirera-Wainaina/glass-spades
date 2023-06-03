const FormDataHandler = require('../../utils/formDataHandler');
const db = require('../../database/models');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv');
const fsPromises = require('fs/promises')
const { minifyImage, saveImage } = require('../../utils/images');
dotenv.config()

exports.saveAuthor = async function (request, response) {
  try {
    const [fields, files] = await new FormDataHandler(request).run();
    const result = await bcrypt.compare(fields.adminPassword, process.env.ENCRYPTED_ADMIN_PASSWORD);

    if (result) {
      const [ convertedFileMetadata ] = await minifyImage(files[0]);
      const cloudFile = await saveImage(convertedFileMetadata.destinationPath);
      const [ cloudMetadata ] = await cloudFile.getMetadata();

      await db.Author.create({
        ...fields,
        profileImageLink: cloudMetadata.mediaLink,
        profileImageName: cloudMetadata.name
      })
      await Promise.all([
        fsPromises.unlink(convertedFileMetadata.destinationPath), 
        fsPromises.unlink(convertedFileMetadata.sourcePath)
      ]);
      console.log('successfully save author')
      response.writeHead(200, { 'content-type': 'text/plain' })
      response.end('success');
    } else {
      response.writeHead(401, {'content-type': 'text/plain'});
      response.end('forbidden-error')
    }
  } catch (error) {
    console.log(error);
    response.writeHead(500, {'content-type': 'text/plain'})
    response.end('server-error')
  }
}