const { default: puppeteer } = require('puppeteer');
const fsPromises = require('fs/promises');
const db = require('../database/models');
const path = require('path');
const dotenv = require('dotenv')
dotenv.config();

exports.renderListingRelatedPages = async function (id, listingHeading, mandate) {
    const urlHeading = urlifySentence(listingHeading);
    const listingUrl = `${process.env.URL}/listing/${urlHeading}?id=${id}`;
    const mandatePage = `${process.env.URL}/${mandate == 'Rent' ? 'rentals': 'sales'}`;

    const contentAndUrl = await Promise.all([listingUrl, mandatePage]
        .map(url => renderPage(url)));

    await Promise.all(contentAndUrl.map(
        data => writeHTMLToFile(data.content, createFileNameFromUrl(data.url))
    ))
}

async function renderAndSaveHTMLToFile(url) {
    const { content } = await renderPage(url);
    return writeHTMLToFile(content, createFileNameFromUrl(url));
}

async function renderAndSaveHTMLsToFiles(urls) {
    return Promise.all(urls.map(url => renderPage(url)))
        .then(contentAndUrls => Promise.all(
            contentAndUrls.map(
                contentAndUrl => writeHTMLToFile(
                    contentAndUrl.content, 
                    createFileNameFromUrl(contentAndUrl.url)
                )
            )
        ))
}

async function renderPage(url) {
    const browser = await setUpBrowser();
    const page = await browser.newPage();

    await page.setUserAgent("glassspades-headless-chromium");
    await page.setRequestInterception(true);

    page.on('request', handleInterceptedRequest);

    await page.goto(url, { waitUntil: 'networkidle0' });

    const content = await page.content();
    await page.close();
    await tearDownBrowser(browser);
    return { content, url }
} 

async function setUpBrowser() {
    if (global.wsEndpoint) {
        return puppeteer.connect({ browserWSEndpoint: wsEndpoint });
    } else {
        browser = await puppeteer.launch({
            args: ['--no-sandbox']
        });
        global.wsEndpoint = browser.wsEndpoint();
        return browser
    }
}

function handleInterceptedRequest(interceptedRequest) {
    const allowList = ['document', 'script', 'xhr', 'fetch'];
    
    if (!allowList.includes(interceptedRequest.resourceType())) {
        return interceptedRequest.abort()
    }
    interceptedRequest.continue();
}

function tearDownBrowser(browser) {
    if (browser.pages.length >= 1) {
        return;
    }
    global.wsEndpoint = null;
    return browser.close();
}

function urlifySentence(sentence) {
    return sentence
        .toLowerCase()
        .trim()
        .replace(/ /g, '-')
  	    .replace(/[^A-Za-z-]/g, '')
}

function writeHTMLToFile(content, staticFilePath) {
    const filePath = path.join(__dirname, '..', 'static', staticFilePath);
    return fsPromises.writeFile(filePath, content)
}

function createFileNameFromUrl(url) {
  const parsedUrl = new URL(url);
	const dir = path.basename(path.dirname(parsedUrl.pathname));

  if (parsedUrl.pathname == '/') {
      return 'home.html'
  } else if (parsedUrl.pathname == '/sales' || parsedUrl.pathname == '/rentals') {
      return `${parsedUrl.pathname}.html`
  } else if (dir == "listing" || dir == "article") {
      return `/${dir}s/${parsedUrl.searchParams.get('id')}.html`
  } else if (parsedUrl.pathname == "/articles") {
      let page = parsedUrl.searchParams.get("page");
			if (!page) page = 1;
      return `/article-lists/${page}.html`
  }
}

exports.renderArticleRelatedPages = async function (urlTitle, id) {
  const urls = await createArticleRelatedUrls(urlTitle, id);
	const contentAndUrl = await Promise.all(urls.map(url => renderPage(url)));
	await Promise.all(contentAndUrl.map(
		data => writeHTMLToFile(data.content, createFileNameFromUrl(data.url))
	))
}
  
async function createArticleRelatedUrls(urlTitle, id) {
  const articleCount = await db.Article.find().estimatedDocumentCount();
  const pageNumber = Math.ceil(articleCount/10);
  const urls = [`${process.env.URL}/article/${urlTitle}?id=${id}`];

  for (let index = 1; index <= pageNumber; index++) {
    urls.push(`${process.env.URL}/articles?page=${index}`);
  }
  return urls
}

exports.renderPage = renderPage;
exports.renderAndSaveHTMLToFile = renderAndSaveHTMLToFile;
exports.renderAndSaveHTMLsToFiles = renderAndSaveHTMLsToFiles;