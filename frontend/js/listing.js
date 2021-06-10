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
	    sessionStorage.setItem("details", this.response);

	    runBodyFunctions()
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
	    displayFirstImages(images);
	}
    }
}

function runBodyFunctions() {
    setTitle()
    setHeading();
    createBody();
}


function displayFirstImages(images) {
    const imageDiv = document.getElementById("images");
    const imageElements = document.querySelectorAll("div#images > img");
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
    let mainIndex = Number(sessionStorage.getItem("mainIndex"));
    mainIndex += 1;

    for (let i = 0; i < imgElements.length; i++) {
	if (mainIndex >= images.length) mainIndex = mainIndex % images.length;

	if (i == 0) sessionStorage.setItem("mainIndex", mainIndex);
	imgElements[i].src = images[mainIndex++];
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

function setHeading() {
    const details = JSON.parse(sessionStorage.getItem("details"));
    console.log(details);
    const heading = document.getElementById("heading");
    heading.textContent = details.Heading;
}

function setTitle() {
    const details = JSON.parse(sessionStorage.getItem("details"));
    const title = document.querySelector("title");
    title.textContent += details.Heading;
}

function createBody() {
    const fragment = new DocumentFragment();
    const page = document.querySelector(".page");
    const footer = document.querySelector("footer");
    const details = JSON.parse(sessionStorage.getItem("details"));

    fragment.append(createDescription(details.Description));

    fragment.append(createSection("Category", details.Category));
    fragment.append(createSection("Bedrooms", details.Bedrooms));
    fragment.append(createSection("Bathrooms", details.Bathrooms));
    fragment.append(createSection("Internal Features",
				  details["Internal Features"]));
    fragment.append(createSection("External Features",
				  details["External Features"]));

    page.insertBefore(fragment, footer);
}

function createDescription(description) {
    const fragment = new DocumentFragment();

    description.split("\r\n").forEach(paragraph => {
	const pEl = document.createElement("p");
	pEl.classList.add("description");
	pEl.textContent = paragraph;
	fragment.append(pEl);
    })

    return fragment
}
function createSection(name, value) {
    const fragment = new DocumentFragment();
    const section = document.createElement("section");

    section.append(createSubheading(name));
    section.append(createContent(value));
    fragment.append(section);
    return fragment
}

function createSubheading(text) {
    const hEl = document.createElement("h3");
    hEl.classList.add("subheading");
    hEl.textContent = text;
    return hEl
}

function createContent(content) {
    if (Array.isArray(content)) {
	const fragment = new DocumentFragment();
	const divEl = document.createElement("div");
	divEl.classList.add("features");

	content.forEach(subcontent => {
	    const pEl = document.createElement("p");
	    pEl.classList.add("content");
	    pEl.textContent = subcontent;
	    divEl.append(pEl);
	})
	fragment.append(divEl);
	return fragment

    } else {
	const pEl = document.createElement("p");
	pEl.classList.add("content");
	pEl.textContent = content;
	return pEl
    }
}
