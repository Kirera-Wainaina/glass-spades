const db = require("../../database/models");
const FormDataHandler = require("../../utils/formDataHandler");
const { renderArticleRelatedPages } = require("../../utils/serverRender");

exports.getAuthorNames = async function (request, response) {
  try {
    const docs = await db.Author.find({}, {
      authorName: 1
    })
    response.writeHead(200, {"content-type": "application/json"});
    response.end(JSON.stringify(docs));
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}

exports.saveArticle = async function (request, response) {
  try {
    const [fields] = await new FormDataHandler(request).run();
    const docs = await db.Article.find({ urlTitle: fields.urlTitle });
    if (docs.length) {
      // urlTitle exists
      response.writeHead(500, {"content-type": "text/plain"});
      response.end("url-exists");
    } else {
      await db.Article.create(fields);
      await renderArticleRelatedPages(fields.urlTitle, fields._id);
      console.log("Article saved successfully");
      response.writeHead(200, {"content-type": "text/plain"});
      response.end("success");
    }
  } catch (error) {
    console.log(error);
    response.writeHead(500, {"content-type": "text/plain"});
    response.end("server-error");
  }
}