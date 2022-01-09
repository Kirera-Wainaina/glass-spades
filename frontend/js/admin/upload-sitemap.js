const form = document.querySelector("form");
form.addEventListener("submit", event => {
    event.preventDefault();
    console.log("submit")
    const formdata = new FormData();
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload-sitemap/up")
});
