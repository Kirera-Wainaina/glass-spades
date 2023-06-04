export function showLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "flex";

}

export function hideLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "none";
}

export function checkLogin() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/login/checkLogin");
    xhr.send()

    xhr.onreadystatechange = function() {
	    if (xhr.readyState == 4 && xhr.response == "fail") {
	        location.href = "/login"
	    }
    }
}

export function urlifySentence(sentence) {
    return sentence
        .toLowerCase()
        .trim()
        .replace(/ /g, '-')
  	    .replace(/[^A-Za-z-]/g, '')
}

export function displaySnackbar(snackbarId) {
    const snackbar = document.getElementById(snackbarId);
    snackbar.addEventListener('animationend', () => {
        snackbar.classList.remove('slide');
        snackbar.classList.add('hide')
    })
    snackbar.classList.add('slide');
    snackbar.classList.remove('hide');
}

export function generateRandomName() {
    const number = Math.trunc(Math.random()*1e6);
    const date = Date.now();
    return `${number}-${date}`
}

export function toggleElementClass(element, className) {
    element.classList.toggle(className)
}

export function createImageElement(src, alt, width, height) {
  const imgEl = document.createElement('img');
  imgEl.src = src;
  imgEl.alt = alt;
  if (!width) {
      throw new Error("Width cannot be undefined");
  } else if (!height) {
      throw new Error('Height cannot be undefined');
  } else {
      imgEl.width = width;
      imgEl.height = height;
  }
  return imgEl
}

export function createTextElement(tagName, textContent) {
  const element = document.createElement(tagName);
  element.textContent = textContent;
  return element;
}

export function createDateString(milliseconds) {
  const dateObj = new Date(Number(milliseconds));
  const month = getNameOfMonth(dateObj.getMonth());
  const year = dateObj.getFullYear();
  const day = dateObj.getDate();

  return `${month} ${day}, ${year}`;
}

export function createDateBylineElement(publishedDate, updatedDate) {
  if (isOneWeekSincePublishing(publishedDate, updatedDate)) {
      return createTextElement('p', `Updated: ${createDateString(updatedDate)}`)
  } else {
      return createTextElement('p', `Published: ${createDateString(publishedDate)}`)
  }
}

export function getNameOfMonth(index) {
  const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October','November', 'December'
  ]
  return MONTHS[index]
}

export function isOneWeekSincePublishing(publishedDate, updatedDate) {
  const oneWeekInMilliseconds = 7*24*60*60*1000;
  const timeDifference = Number(updatedDate) - Number(publishedDate);
  
  if (timeDifference >= oneWeekInMilliseconds) return true;
  return false
}

export function getIdFromURL(url=location.href) {
  const urlObject = new URL(url);
  const params = new URLSearchParams(urlObject.search);
  return params.get('id');
}

export function getArticleUrlTitle(articleUrl=location.href) {
  const urlObject = new URL(articleUrl);
  const [ urlTitle ] = urlObject.pathname.match(/(?<=\/articles\/).*/);
  return urlTitle;
}