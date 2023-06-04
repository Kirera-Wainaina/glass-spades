import { createArticleContainer } from "./article-list.js";
import { 
    createDateBylineElement,
    createTextElement, 
    getIdFromURL, 
    getArticleUrlTitle, 
    urlifySentence, 
    createImageElement 
} from "./general.js";

export async function render(parentContainer, data) {
    let container = new DocumentFragment();

    const landscapeImage = createArticleImage(
        data.landscapeImage, 
        data.landscapeImageText, 
        'landscape-wall-image');
    const portraitImage = createSrcsetImage(
        data.portraitImage, 
        data.portraitImageText, 
        'portrait-wall-image');
    const picture = createPictureElement(portraitImage, landscapeImage);
    
    container.append(createTextElement('h1', data.title))
    container.append(picture);
    container.append(createDescription(data.description))
    container.append(createArticleContent(
        data.content, 
        data.publishedDate, 
        data.updatedDate ?? data.publishedDate // some articles don't have an updatedDate
        ));
    container.append(await createAuthor(data.authorId));
    if (data.relatedArticle1 || data.relatedArticle2) {
        container.append(
            await createRelatedArticlesSection(data.relatedArticle1, data.relatedArticle2)
        );
    }

    if (parentContainer.tagName == 'BODY') {
        parentContainer.insertBefore(container, document.querySelector('footer'));
    } else {
        parentContainer.replaceChildren(container)
    }
    // insert table of contents after article is rendered in order to retrieve headings
    parentContainer.insertBefore(
        createTableOfContents(), 
        document.querySelector('article')
    )
}

export async function renderOnArticlePage(data) {
    const parentContainer = document.querySelector('body');
    await render(parentContainer, data);
    insertTitle(data.title);
    insertDescription(data.description);
}

function createArticleImage(imageUrl, imageText, imageId) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = imageText;
    img.id = imageId;
    img.height = '810';
    img.width = '1920'
    return img
}


function createSrcsetImage(imageUrl, imageText, imageId) {
    const source = document.createElement('source');
    source.srcset = imageUrl;
    source.media = '(orientation: portrait)';
    source.width = '1080';
    source.height = '864';
    return source
}

function createPictureElement(portraitImage, landscapeImage) {
    const picture = document.createElement('picture');
    picture.append(portraitImage);
    picture.append(landscapeImage);
    return picture;
}

function createDescription(descriptionText) {
    const p = createTextElement('p', descriptionText);
    p.id = 'description';
    return p
}

function createDateBylineContainer(publishedDate, updatedDate) {
    const div = document.createElement('div');
    div.id = 'date-byline';
    div.append(createClockIcon());
    div.append(createDateBylineElement(publishedDate, updatedDate));
    return div;
}

function createClockIcon() {
    const img = document.createElement('img');
    img.src = '/frontend/images/clock-icon.svg';
    img.alt = 'clock';
    img.width = '18';
    img.height = '18';
    return img
}

function createArticleContent(content, publishedDate, updatedDate) {
    const article = document.createElement('article');
    article.append(createDateBylineContainer(publishedDate, updatedDate))
    article.innerHTML += content;
    return article;
}

function createTableOfContents() {
    const div = document.createElement('div');
    const headings = document.querySelectorAll(
        'article h2, article h3, article h4, article h5');

    div.append(createTextElement('h2', 'Table of contents'));
    headings.forEach(element => {
        div.append(createTableOfContentsLink(element));
        addIdToHeading(element);
    });
    div.id = 'table-of-contents';

    return div
}

function createTableOfContentsLink(element) {
    const a = document.createElement('a');
    a.textContent = element.textContent;
    a.href = `#${urlifySentence(element.textContent)}`;
    setLeftMargin(a, element);
    return a
}

function addIdToHeading(headingElement) {
    headingElement.id = urlifySentence(headingElement.textContent);
    return;
}

function setLeftMargin(aElement, headingElement) {
    switch (headingElement.tagName) {
        case 'H2':
            aElement.classList.add('h2-margin-left')
            break;
        case 'H3':
            aElement.classList.add('h3-margin-left')
            break;
        case 'H4':
            aElement.classList.add('h4-margin-left')
            break;
        case 'H5':
            aElement.classList.add('h5-margin-left')
            break;
        case 'H6':
            aElement.classList.add('h6-margin-left')
            break;
        default:
            break;
    }
}

function insertTitle(title) {
    document.title = `${title} | The Talking Owl`
}

function insertDescription(description) {
    const element = document.querySelector('meta[name="description"]');
    element.content = description;
}

async function createRelatedArticlesSection(url1, url2) {
    const fragment = new DocumentFragment();
    fragment.append(createRelatedArticlesHeading());
    const containers = await Promise.all([
        url1 && createRelatedArticleContainer(url1), 
        url2 && createRelatedArticleContainer(url2)
    ])
    const div = document.createElement('div');
    div.id = 'related-articles';
    containers.forEach(container => div.append(container));
    fragment.append(div);
    return fragment
}

function createRelatedArticlesHeading() {
    const h2 = createTextElement('h2', 'Related Articles');
    h2.id = 'related-articles-heading';
    return h2;
}

function createRelatedArticleContainer(url) {
    return new Promise((resolve, reject) => {
        const id = getIdFromURL(url);
        const urlTitle = getArticleUrlTitle(url);
        
        // use index of five so image can have loading attribute
        fetchRelatedArticleData(id, urlTitle)
            .then(data => {
                const a = createArticleContainer(data[0], 5);
                a.href = `/articles/${urlTitle}?id=${id}`;
                resolve(a);
            })
            .catch(error => reject(error))
    })
}

function fetchRelatedArticleData(id, urlTitle) {
    return fetch(`/api/articles?field=title&field=description&field=landscapeImage\
&field=landscapeImageText&field=publishedDate&id=${id}&urlTitle=${urlTitle}`)
    .then(response => response.json());
}

function fetchAuthor(authorId) {
    return fetch(`/api/authors?field=authorName&field=bio&field=profileImageLink&id=${authorId}`)
        .then(response => response.json())
}

async function createAuthor(authorId) {
    const [ author ] = await fetchAuthor(authorId);
    const div = document.createElement('div');
    div.id = 'author-section';
    div.append(createImageElement(
        author.profileImageLink, 
        `${author.authorName} profile image`, 
        200, 
        200
    ));
    div.append(createAuthorTextSection(author.bio, author.authorName));
    return div
}

function createAuthorTextSection(bio, name) {
    const div = document.createElement('div');
    div.id = 'author-text';

    div.append(createTextElement('p', bio));
    div.append(createTextElement('p', name));
    div.append(createTextElement('p', '- Author'));

    return div
}