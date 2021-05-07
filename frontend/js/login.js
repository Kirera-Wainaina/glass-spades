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
}
