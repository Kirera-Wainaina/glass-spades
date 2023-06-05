document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("form");
    form.addEventListener("submit", (event) => {
        event.preventDefault();
    
        const formdata = new FormData(form);
        loginUser(formdata);
    })    

    const emailInput = document.querySelector("#email");
    emailInput.addEventListener("focus", toggleEmailError);

    const passwordInput = document.querySelector("#password");
    passwordInput.addEventListener("focus", toggleEmailError)
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
	    location.href = "/admin/home"
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


function toggleEmailError(event) {
    const emailError = document.querySelector("#email-error");
    if (emailError.classList.contains("show-error")) {
	    emailError.classList.remove("show-error");
	    emailError.classList.add("hide-error");
	    event.target.value = "";
    }    
}