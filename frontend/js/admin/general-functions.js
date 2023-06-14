import { checkLogin, displaySnackbar, hideLoadingPage, showLoadingPage } from "../general.js"

if (navigator.userAgent != "glassspades-headless-chromium") {
    checkLogin();
}

document.addEventListener("DOMContentLoaded", () => {
  const renderListingsButton = document.getElementById("render-listings");
  renderListingsButton.addEventListener("click", () => serverRender("listings"));

  const renderArticlesButton = document.getElementById("render-articles");
  renderArticlesButton.addEventListener("click", () => serverRender("articles"))
})

function serverRender(type) {
  let url;
  if (type == "listings") {
    url = "/api/admin/general-functions/renderListings"
  } else {
    url = "/api/admin/general-functions/renderArticles"
  }
  showLoadingPage()

  fetch(url)
    .then(response => response.text())
    .then(handleRenderResponse)
}

function handleRenderResponse(text) {
  hideLoadingPage()
  if (text == "success") {
    displaySnackbar("render-success")
  } else {
    displaySnackbar("render-failed")
  }
}