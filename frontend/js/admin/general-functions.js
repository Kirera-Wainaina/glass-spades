import { checkLogin, displaySnackbar } from "../general.js"

if (navigator.userAgent != "glassspades-headless-chromium") {
    checkLogin();
}

const form = document.querySelector("form");
form.addEventListener("submit", event => {
  event.preventDefault();

  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/api/admin/general-functions/uploadSitemap");
  xhr.send(new FormData(form))

  xhr.onreadystatechange = function() {
			if (this.readyState == 4) {
			  if (this.responseText == "success") {
					displaySnackbar('sitemap-success');
			  }
			}
    }
});
