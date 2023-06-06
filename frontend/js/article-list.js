/* this list is for inputing the article data into a display list
* the pages that will need this are edit-article, general and tech pages
*/

import { createDateBylineElement, createImageElement, createTextElement } from "./general.js";

export function createArticleContainer(articleData, index) {
    const a = document.createElement('a');

    a.append(createArticleCardImage(
        articleData.landscapeImage, 
        articleData.landscapeImageText, 
        index
    ))
    a.append(createTextElement('h2', articleData.title));
    a.append(createTextElement('p', articleData.description));
    a.append(createDateBylineElement(articleData.publishedDate, articleData.updatedDate));
    a.classList.add('article-card');
    return a
}

export function displayArticleList(element, data, urlFunction) {
    const fragment = new DocumentFragment();
    data.forEach((article, index) => {
        const a = createArticleContainer(article, index);
        a.href = urlFunction(article.urlTitle, article._id);
        fragment.append(a);
    })
    element.appendChild(fragment);
}

function addLoadingAttribute(imageElement, index) {
    const mediaQuery = window.matchMedia('(orientation: portrait)');

    if (mediaQuery.matches) { // it is portrait
        if (index > 1) imageElement.loading = 'lazy';
    } else { // landscape images
        if (index > 3) imageElement.loading = 'lazy';
    }
}

export function getCurrentPageNumber() {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.has('page')) return Number(searchParams.get('page'));
    return 1;
}

export async function displayPageNumbers(articleCount) {
    const currentPageNumber = getCurrentPageNumber();
    const container = document.getElementById('page-numbers');

    const mainFragment = generatePageNumberLinks(articleCount, currentPageNumber);
    const skipForwardFragment = generateSkipForwardPageNumberLinks(articleCount, currentPageNumber);
    const skipBackFragment = generateSkipBackPageNumberLinks(currentPageNumber);

    container.appendChild(skipBackFragment);
    container.appendChild(mainFragment);
    container.appendChild(skipForwardFragment);
}

function generatePageNumberLinks(articleCount, currentPageNumber) {
    const fragment = new DocumentFragment();
    const maxPageNumber = Math.ceil(articleCount / 10);

    if (articleCount <= 100) { // <10 pages, we only need single digit page numbers
        for (let i = 1; i <= maxPageNumber; i++) {
            const a = createPageNumberLink(i, currentPageNumber);
            fragment.append(a);
        }
        return fragment
    } else {
        // article count > 100
        // show 5 previous pages and 5 next pages
        let maxDisplay= null;
        let minDisplay = null;

        (currentPageNumber + 5) > maxPageNumber
            ? maxDisplay = maxPageNumber
            : maxDisplay = currentPageNumber + 5;

        (currentPageNumber - 5) < 1
            ? minDisplay = 1
            : minDisplay = currentPageNumber - 5;

        for (let i = minDisplay; i <= maxDisplay; i++) {
            const a = createPageNumberLink(i, currentPageNumber);
            fragment.append(a);
        }
        return fragment
    }
}

function createPageNumberLink(pageNumber, currentPageNumber) {
    const a = createTextElement('a', pageNumber);
    a.href = `${location.pathname}?page=${pageNumber}`;
    if (pageNumber == currentPageNumber) a.classList.add('current-page-number');
    return a
}

function generateSkipForwardPageNumberLinks(articleCount, currentPageNumber) {
    const fragment = new DocumentFragment();
    const nextTenthPageNumber = Math.ceil(currentPageNumber / 10) * 10;
    const maximumTenthPageNumber = Math.floor(articleCount / 100) * 10;
    let maxDisplay = null;

    const p = createTextElement('p', '...');
    fragment.append(p);

    if (maximumTenthPageNumber > nextTenthPageNumber + 30) {
        // display only 3 tenth numbers
        maxDisplay = nextTenthPageNumber + 30;
    } else {
        maxDisplay = maximumTenthPageNumber;
    }

    for (let i = nextTenthPageNumber + 10; i <= maxDisplay; i += 10) {
        const a = createPageNumberLink(i, currentPageNumber);
        fragment.append(a);
    }
    return fragment
}

function generateSkipBackPageNumberLinks(currentPageNumber) {
    const fragment = new DocumentFragment();
    const previousTenthPageNumber = Math.floor(currentPageNumber / 10) * 10;
    let minDisplay = null;

    if (previousTenthPageNumber - 30 > 10) {
        // display on the previous 3 tenth page numbers
        minDisplay = previousTenthPageNumber - 30;
    } else {
        minDisplay = 10;
    }

    for (let i = minDisplay; i <= previousTenthPageNumber - 10; i += 10) {
        const a = createPageNumberLink(i, currentPageNumber);
        fragment.append(a);
    }

    const p = createTextElement('p', '...');
    fragment.append(p);

    return fragment
}

function createArticleCardImage(landscapeImage, landscapeImageText, index) {
    const imageElement = createImageElement(
        landscapeImage, 
        landscapeImageText,
        '1920',
        '810'
    );
    addLoadingAttribute(imageElement, index); // add loading attribute
    return imageElement
}


export function setCanonicalLinkTagForPage1(category) {
    const params = new URLSearchParams(location.search);

    if (params.get('page') == '1') {
        const head = document.querySelector('head');
        const link = document.createElement('link');
        link.rel = 'canonical';
        link.href = `https://glassspades.com/${category}`;
        head.append(link);
    }
}