getListingDetails();
getListingImages();

function retrieveListingId() {
    const url = new URL(location);
    const params = new URLSearchParams(url.search);
    return params.get("id")
}

function getListingDetails() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/listing/getListingDetails");
    xhr.send(JSON.stringify({ id: retrieveListingId() }));

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    console.log(this.response)
	}
    }
}

function getListingImages() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/listing/getListingImages");
    xhr.send(JSON.stringify({ id: retrieveListingId() }));

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    sessionStorage.setItem("images", this.response);
	    const images = JSON.parse(this.response);
	    console.log(images);
	    displayFirstImages(images);
	}
    }
}

function displayFirstImages(images) {
    const imageDiv = document.getElementById("images");
    const imageElements = document.querySelectorAll("div#images > img");
    sessionStorage.setItem("mainImage", 0)
    for (let i = 0; i < imageElements.length; i++) {
	imageElements[i].src = images[i]
    }
}

const backArrow = document.querySelector("div#images div:nth-of-type(1)");
const forwardArrow = document.querySelector("div#images div:nth-of-type(2)");

forwardArrow.addEventListener("click", forwardPhoto);

function forwardPhoto() {
    const images = JSON.parse(sessionStorage.getItem("images"));
    const imgElements = document.querySelectorAll("div#images > img");
    let mainIndex = sessionStorage.getItem("mainIndex");

    for (let i = 0; i < imgElements.length; i++) {
	if (mainIndex >= imgElements.length) mainIndex %= imgElements.length;
	imgElements[i].src = images[++mainIndex];
	if (i == 0) sessionStorage.setItem("mainIndex", mainIndex);
    }
}

backArrow.addEventListener("click", backPhoto);

function backPhoto() {
    const images = JSON.parse(sessionStorage.getItem("images"));
    const imgElements = document.querySelectorAll("div#images > img");
    let mainIndex = sessionStorage.getItem("mainIndex");

    mainIndex -= 1;

    for (let i = 0; i < imgElements.length; i++) {
	if (mainIndex < 0) {
	    mainIndex = images.length - 1;
	} else if (mainIndex >= images.length) {
	    mainIndex = mainIndex % images.length;
	}

	if (i == 0) sessionStorage.setItem("mainIndex", mainIndex);

	imgElements[i].src = images[mainIndex++];
    }
}
