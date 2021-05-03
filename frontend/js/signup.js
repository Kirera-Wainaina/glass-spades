const form = document.querySelector("form");
form.addEventListener("submit", event => {
    event.preventDefault();

    const formdata = new FormData(form)

    if (confirmPasswords(formdata)) {
	formdata.delete("repeat-password");
	createUser(formdata);
    }
});

function confirmPasswords(formdata) {
    const password = formdata.get("password");
    const repeatPassword = formdata.get("repeat-password");
    const errorMsg = document.querySelector("#password-error");

    if (!checkPasswordsMatch(password, repeatPassword)) {
	errorMsg.classList.remove("hide-error");
	errorMsg.classList.add("show-error");
	return false
    } else {
	if (errorMsg.classList.contains("show-error")) {
	    errorMsg.classList.add("hide-error");
	    errorMsg.classList.remove("show-error");
	}
	return true
    }
}

function checkPasswordsMatch(password, repeatPassword) {
    return password == repeatPassword ? true : false;
}

const passwordInput = document.querySelector("#password");
passwordInput.addEventListener("focus", () => {
    const passwordError = document.querySelector("#password-error");
    const repeatPasswordInput = document.querySelector("#repeat-password");
    if (passwordError.classList.contains("show-error")) {
	passwordError.classList.remove("show-error");
	passwordError.classList.add("hide-error");
	passwordInput.value = "";
	repeatPasswordInput.value = "";
    }
});

const emailInput = document.querySelector("#email");
emailInput.addEventListener("focus", () => {
    const emailError = document.querySelector("#email-error");
    if (emailError.classList.contains("show-error")) {
	emailError.classList.remove("show-error");
	emailError.classList.add("hide-error");
	emailInput.value = "";
    }
});

function createUser(formdata) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/signup/createUser");
    xhr.send(formdata);

    showLoadingPage();
    
    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    if (this.response == "notAdmin") {
		showAdminError()
	    } else if (this.response == "emailExists"){
		showEmailError()
	    }
	}
    }

    xhr.onload = hideLoadingPage;
}

function showAdminError() {
    const adminError = document.querySelector("#admin-error");
    adminError.classList.remove("hide-error");
    adminError.classList.add("show-error");
    adminError.value = "";
}

function showEmailError() {
    const emailError = document.querySelector("#email-error");
    emailError.classList.remove("hide-error");
    emailError.classList.add("show-error");
    emailError.value = "";
}

function showLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "flex";
}

function hideLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "none";
}
