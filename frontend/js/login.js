const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formdata = new FormData(form);
    loginUser(formdata);
})

function loginUser(formdata) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/login/loginUser");
    xhr.send(formdata);

    xhr.onreadystatechange = function () {
	if (this.readyState == 4 && this.response == "error") {
	    showError()
	} else if (this.readyState == 4 && this.response == "success") {
	    location.reload();
	}
    }
}

function showError() {
    const errorMsg = document.getElementById("email-error");
    errorMsg.classList.remove("hide-error");
    errorMsg.classList.add("show-error")
}

// function showLoadingPage() {
//     const loadingPage = document.getElementById("loading-page");
//     loadingPage.style.display = "flex";
// }

// function hideLoadingPage() {
//     const loadingPage = document.getElementById("loading-page");
//     loadingPage.style.display = "none";
// }
