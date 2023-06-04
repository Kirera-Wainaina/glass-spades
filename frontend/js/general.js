export function showLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "flex";

}

export function hideLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "none";
}

export function closeElements(...elements) {
    elements.forEach(element => element.style.display = "none");
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