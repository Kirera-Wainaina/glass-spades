const FormDataHandler = require('../../utils/formDataHandler');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv');
dotenv.config()

exports.saveAuthor = async function (request, response) {
  try {
    const [fields, files] = await new FormDataHandler(request).run();
    const result = await bcrypt.compare(fields.adminPassword, process.env.ENCRYPTED_ADMIN_PASSWORD);

    if (result) {
      console.log(files, fields);
      
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