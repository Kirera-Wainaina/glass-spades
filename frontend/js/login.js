window.addEventListener("load", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/signup/checkLogin");
    xhr.send();

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    console.log(this.response)
	    location.href = this.response
	}
    }
});


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

    showLoadingPage()

    xhr.onreadystatechange = function () {
	if (this.readyState == 4 && this.response == "error") {
	    showError()
	} else if (this.readyState == 4 && this.response == "success") {
	    location.reload();
	}
    }

    xhr.onload = hideLoadingPage();
}

function showError() {
    const errorMsg = document.getElementById("email-error");
    errorMsg.classList.remove("hide-error");
    errorMsg.classList.add("show-error")
}

function showLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "flex";
}

function hideLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "none";
}

const emailInput = document.querySelector("#email");
emailInput.addEventListener("focus", () => {
    const emailError = document.querySelector("#email-error");
    if (emailError.classList.contains("show-error")) {
	emailError.classList.remove("show-error");
	emailError.classList.add("hide-error");
	emailInput.value = "";
    }
});

const passwordInput = document.querySelector("#password");
// There's one error in the login page under the id--email-error
passwordInput.addEventListener("focus", () => {
    const emailError = document.querySelector("#email-error");
    if (emailError.classList.contains("show-error")) {
	emailError.classList.remove("show-error");
	emailError.classList.add("hide-error");
	passwordInput.value = "";
    }
});
