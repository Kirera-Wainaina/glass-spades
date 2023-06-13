import { checkLogin, displaySnackbar } from "../general.js"

if (navigator.userAgent != "glassspades-headless-chromium") {
    checkLogin();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  form.addEventListener("submit", saveSitemap);
})


function saveSitemap(event) {
  event.preventDefault();
  const formdata = new FormData(event.target);
  formdata.append("fileNumber", 1);

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/admin/general-functions/uploadSitemap");
  xhr.send(formdata)

  xhr.onreadystatechange = function() {
		if (this.readyState == 4) {
		  if (this.responseText == "success") {
				displaySnackbar('sitemap-success');
		  } else {
        displaySnackbar("sitemap-upload-error")
      }
		}
  }
}