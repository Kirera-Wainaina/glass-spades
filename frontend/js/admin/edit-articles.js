import { displayArticleList } from "../article-list.js";

document.addEventListener('DOMContentLoaded', retrieveArticleData);

function retrieveArticleData() {
  fetch("/api/admin/edit-articles/retrieveArticleData")
    .then(response => response.json())
    .then(data => displayArticleList(
      document.getElementById('article-list'),
      data,
      createEditHref
  ))
}

function createEditHref(urlTitle, id) {
    return `/admin/edit-article?urlTitle=${urlTitle}&id=${id}`
}