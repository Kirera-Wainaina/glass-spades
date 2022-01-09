const form = document.querySelector("form");
form.addEventListener("submit", event => {
    event.preventDefault();

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/general-functions/uploadSitemap");
    xhr.send(new FormData(form))

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    console.log(this.response)
	}
    }
});
