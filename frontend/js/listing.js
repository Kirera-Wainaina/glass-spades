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
    if (!document.querySelector(".description")) {
	const details = JSON.parse(sessionStorage.getItem("details"));
	setTitle(details)
	setHeading(details);
	setMetaDescription(details);
	createBody(details);
    }
}

function displayFirstImages(images) {
    const imageDiv = document.getElementById("images");
    const imageElements = document.querySelectorAll("div#images > img");
    for (let i = 0; i < imageElements.length; i++) {
	const image = images.filter(imageObject => imageObject.position == i)[0];
	imageElements[i].src = image.link;
    }
}

const backArrow = document.querySelector("div#images div:nth-of-type(1)");
const forwardArrow = document.querySelector("div#images div:nth-of-type(2)");

forwardArrow.addEventListener("click", forwardPhoto);

function forwardPhoto() {
    const images = JSON.parse(sessionStorage.getItem("images"));
    const imgElements = document.querySelectorAll("div#images > img");
    const mainPhotoLink = imgElements[0].src;
    const mainPhotoPosition = images
	  .filter(image => mainPhotoLink == image.link)[0].position;

    for (let i = 0; i < imgElements.length; i++) {
	let indexPosition = mainPhotoPosition + 1 + i;
	if (indexPosition >= images.length) {
	    indexPosition = indexPosition % images.length;
	};
	imgElements[i].src = images
	    .filter(image => image.position == indexPosition)[0].link;
    }
}

backArrow.addEventListener("click", backPhoto);

function backPhoto() {
    const images = JSON.parse(sessionStorage.getItem("images"));
    const imgElements = document.querySelectorAll("div#images > img");
    const mainPhotoLink = imgElements[0].src;
    const mainPhotoPosition = images
	  .filter(image => mainPhotoLink == image.link)[0].position;

    for (let i = 0; i < imgElements.length; i++) {
	let indexPosition = mainPhotoPosition + i - 1;
	if (indexPosition < 0) {
	    indexPosition += images.length;
	} else if (indexPosition >= images.length) {
	    indexPosition = images.length % indexPosition;
	}
	imgElements[i].src = images
	    .filter(image => image.position == indexPosition)[0].link;
    }
}

function setHeading(details) {
    const heading = document.getElementById("heading");
    heading.textContent = details.Heading;
}

function setTitle(details) {
    const title = document.querySelector("title");
    title.textContent += details.Heading;
}

async function createBody(details) {
    const fragment = new DocumentFragment();
    const page = document.querySelector(".page");
    const form = document.querySelector("form");
    const price = new Intl
	  .NumberFormat("sw-ke", { style: "currency", currency: "Kes"})
	  .format(details.Price);

    fragment.append(createDescription(details.Description));

    fragment.append(createSection("Category", details.Category));
    fragment.append(createSection("Mandate", details.Mandate));
    fragment.append(createSection("Bedrooms", details.Bedrooms));
    fragment.append(createSection("Bathrooms", details.Bathrooms));
    fragment.append(createSection("Internal Features",
				  details["Internal Features"]));
    fragment.append(createSection("External Features",
				  details["External Features"]));
    fragment.append(createSection("Price", price));

    if(await confirmLogin()) {
	const coordinates = [details.Location.coordinates[1],
			     details.Location.coordinates[0]]
	fragment.append(createSection("Location", coordinates));
    }
    // fragment.append(createSection("Location", coordinates));
    
    page.insertBefore(fragment, form);
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

function setMetaDescription(details) {
    const description = document.querySelector("meta[name='description']");
    description.content = details.Description.split("\r\n")[0];
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

function confirmLogin() {
    return new Promise((resolve, reject) => {
	const xhr = new XMLHttpRequest();
	xhr.open("GET", "/api/signup/checkLogin");
	xhr.send()

	xhr.onreadystatechange = function() {
	    if (this.readyState == 4) {
		resolve(this.response)
	    }
	}
    })
}

const form = document.querySelector("form");
form.addEventListener("submit", event => {
    event.preventDefault();
});
