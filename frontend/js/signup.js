const form = document.querySelector("form");
form.addEventListener("submit", event => {
    event.preventDefault();

    const formdata = new FormData(form)

    if (confirmPasswords(formdata)) {
	formdata.delete("repeat-password");
	// handleSignupProcess(formdata)
    }
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/signup/createUser");
    xhr.send(formdata);
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
