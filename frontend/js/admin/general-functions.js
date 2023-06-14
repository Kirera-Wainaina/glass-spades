import { checkLogin, displaySnackbar, hideLoadingPage, showLoadingPage } from "../general.js"

if (navigator.userAgent != "glassspades-headless-chromium") {
    checkLogin();
}

document.addEventListener("DOMContentLoaded", () => {
  const renderListingsButton = document.getElementById("render-listings");
  renderListingsButton.addEventListener("click", renderListings)
})

function renderListings() {
  showLoadingPage()

  fetch("/api/admin/general-functions/renderListings")
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