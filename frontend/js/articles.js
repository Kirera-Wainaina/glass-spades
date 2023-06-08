import { 
  displayArticleList, 
  getCurrentPageNumber, 
  displayPageNumbers, 
  setCanonicalLinkTagForPage1 
} from "./article-list.js";

document.addEventListener('DOMContentLoaded', async () =>{
  if (navigator.userAgent != 'glassspades-headless-chromium') return;
  retrieveArticleData();
  displayPageNumbers(await retrieveArticleCount());
  setCanonicalLinkTagForPage1('articles');
})

function retrieveArticleData() {
  const pageNumber = getCurrentPageNumber();
  const offset = (pageNumber -1) * 10;

  fetch(`/api/articles/getArticles?limit=10&offset=${offset}`)
    .then(response => response.json())
    .then(data => displayArticleList(
        document.getElementById('article-list'),
        data,
        createArticleHref
    ))      
}

function createArticleHref(urlTitle, id) {
  return `/article/${urlTitle}?id=${id}`
}

function retrieveArticleCount() {
  return fetch('/api/articles/countArticles')
      .then(response => response.json())
}