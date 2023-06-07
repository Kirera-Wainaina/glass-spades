import { getIdFromURL, getArticleUrlTitle } from './general.js';
import { renderOnArticlePage } from './render.js';

document.addEventListener('DOMContentLoaded', async () => {
    if (navigator.userAgent != 'thetalkingowl-puppeteer') return;
    const [ data ] = await retrieveArticle();
    const [authorData] = await retrieveAuthor(data.authorId);

    renderOnArticlePage(data);
    fillStructuredData(data, authorData);
    fillOGElements(data, authorData.authorName);
    insertMetaAuthorName(authorData.authorName);
})

function retrieveArticle() {
    return fetch(`/api/articles/retrieveArticle?id=${getIdFromURL()}&urlTitle=${getArticleUrlTitle()}`)
        .then(response => response.json())

}

function retrieveAuthor(authorId) {
    return fetch(`/api/authors/retrieveAuthorNameAndURL?id=${authorId}`)
    .then(response => response.json())
}

function fillStructuredData(article, author) {
    const structuredDataElement = document
        .querySelector('script[type="application/ld+json"]');
    const structuredData = JSON.parse(structuredDataElement.textContent);
    structuredData['datePublished'] = convertMillisecondsToISO(article.publishedDate);
    structuredData['headline'] = article.title;
    structuredData['image'] = [article.landscapeImage, article.portraitImage];
    if (article.updatedDate) {
        structuredData['dateModified'] = convertMillisecondsToISO(article.updatedDate);
    }
    structuredData['author'] = [createStructuredDataAuthorObject(author)];

    structuredDataElement.textContent = JSON.stringify(structuredData);
}

function convertMillisecondsToISO(milliseconds) {
    return new Date(Number(milliseconds)).toISOString();
}

function fillOGElements(article, authorName) {
    setOGTitle(article.title);
    setOGPublishedTime(article.publishedDate);
    setOGModifiedTime(article.updatedDate);
    setOGArticleAuthor(authorName);
    setOGArticleSection(article.category);
    setOGArticleImage(article.landscapeImage);
    setOGArticleImageAltText(article.landscapeImageText);
    setOGArticleUrl();
    setOGArticleDescription(article.description);
}

function setOGTitle(title) {
    const OGTitle = document.querySelector('meta[name="og:title"]');
    OGTitle.setAttribute('content', title);
}

function setOGPublishedTime(timeInMilliseconds) {
    const element = document.querySelector('meta[name="og:article:published_time"]');
    element.setAttribute('content', convertMillisecondsToISO(timeInMilliseconds));
}

function setOGModifiedTime(timeInMilliseconds) {
    const element = document.querySelector('meta[name="og:article:modified_time"]');
    element.setAttribute('content', convertMillisecondsToISO(timeInMilliseconds));
}

function setOGArticleAuthor(name) {
    const element = document.querySelector('meta[name="og:article:author"]');
    element.setAttribute('content', name);
}

function setOGArticleSection(category) {
    const element = document.querySelector('meta[name="og:article:section"]');
    element.setAttribute('content', category);
}

function setOGArticleImage(imageUrl) {
    const element = document.querySelector('meta[name="og:image"]');
    element.setAttribute('content', imageUrl);
}

function setOGArticleImageAltText(imageAltText) {
    const element = document.querySelector('meta[name="og:image:alt" ]');
    element.setAttribute('content', imageAltText);
}

function setOGArticleUrl() {
    const element = document.querySelector('meta[name="og:url"]');
    element.setAttribute('content', location.href);
}

function setOGArticleDescription(description) {
    const element = document.querySelector('meta[name="og:description"]');
    element.setAttribute('content', description);
}

function createStructuredDataAuthorObject(author) {
    return {
        "@type": "Person",
        "name": author.authorName,
        "url": author.url
    }
}

function insertMetaAuthorName(name) {
    const element = document.querySelector('meta[name="author"]');
    element.setAttribute('content', name);
}