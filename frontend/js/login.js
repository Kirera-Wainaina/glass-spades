const form = document.querySelector("form");
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const formdata = new FormData(form);
    loginUser(formdata);
})

function loginUser(formdata) {
    console.log(formdata.get("email"));
    console.log(formdata.get("password"))
}
