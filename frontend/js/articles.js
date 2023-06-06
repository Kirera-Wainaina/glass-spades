import { 
  displayArticleList, 
  getCurrentPageNumber, 
  displayPageNumbers, 
  setCanonicalLinkTagForPage1 
} from "./article-list.js";

document.addEventListener('DOMContentLoaded', async () =>{
  // restore the line below
  // if (navigator.userAgent != 'glassspades-headless-chromium') return;
  retrieveArticleData();
  displayPageNumbers(await retrieveBusinessArticleCount());
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
//   fetch(`/api/articles?field=title&field=description&\
// field=landscapeImage&field=publishedDate&field=updatedDate\
// &field=urlTitle&field=landscapeImageText&category=business\
// &orderBy=publishedDate&orderByDirection=desc&limit=10&offset=${offset}`)
      
}

function createArticleHref(urlTitle, id) {
  return `/articles/${urlTitle}?id=${id}`
}

function retrieveBusinessArticleCount() {
  return fetch('/api/articles/countArticles')
      .then(response => response.json())
}