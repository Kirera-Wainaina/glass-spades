const db = require("../../database/models");
const FormDataHandler = require('../../utils/formDataHandler');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
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