checkLogin()

function checkLogin() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/signup/checkLogin");
    xhr.send()

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4 && xhr.response == "fail") {
	    location.href = "/login"
	}

    }
}
