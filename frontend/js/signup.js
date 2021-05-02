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

function createUser(formdata) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/signup/createUser");
    xhr.send(formdata);

    xhr.onreadystatechange = function() {
	if (this.readyState == 4 && this.response == "notAdmin") {
	    const adminError = document.querySelector("#admin-error");
	    adminError.classList.remove("hide-error");
	    adminError.classList.add("show-error");
	    adminError.value = "";
	}
    }
}
