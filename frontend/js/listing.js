import { displayHouseDetails } from "./general.js";

// <!-- Google Tag Manager -->
if (location.origin == "https://glassspades.com"
    && navigator.userAgent != "glassspades-headless-chromium") {
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WRW5KFK');
}
// <!-- End Google Tag Manager -->

window.dataLayer = window.dataLayer || [];
getListingDetails();
getListingImages();
getRelatedListings();

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
			if (this.responseText == 'redirect') {
				location.href = '/listing-unavailable';
				return ;
			}
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
	    const received = new Event("received");
	    document.dispatchEvent(received)
	    const images = JSON.parse(this.response);
	    displayFirstImages(images);
	    createThumbnail(images);
	    setImage();
	}
    }
}

function runBodyFunctions() {
    if (!document.querySelector(".description")) {
	const details = JSON.parse(sessionStorage.getItem("details"));
	setTitle(details)
	setHeading(details);
	setMetaDescription(details);
	setOGElements(details);
	createBody(details);
	createWhatsappText();
    }
    // to run even if there is a description
    showAuthDetails();
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

forwardArrow.addEventListener("click", displayOverlay);
backArrow.addEventListener("click", displayOverlay);

function displayOverlay(event) {
    const imageEl = document.getElementById("images");
    if (!imageEl.classList.contains("overlay")) {
	imageEl.classList.add("overlay");

	const closeIcon = document.getElementById("close-icon");
	closeIcon.style.display = "block";

	const next1 = document.getElementById("display-photo-1");
	const next2 = document.getElementById("display-photo-2");
	next1.style.display = "none";
	next2.style.display = "none";
    }
}
forwardArrow.addEventListener("click", () => forwardPhoto(
    document.getElementById("main-photo")));
forwardArrow.addEventListener("click", () => forwardPhoto(
    document.getElementById("display-photo-1")));
forwardArrow.addEventListener("click", () => forwardPhoto(
    document.getElementById("display-photo-2")));

let images, largestPosition;

document.addEventListener("received", () => {
    images = JSON.parse(sessionStorage.getItem("images"));
    largestPosition = images.reduce((accumulator, currentValue, index) => {
	if (index == 0) {
	    return currentValue.position;
	} else {
	    return accumulator > currentValue.position
		? accumulator : currentValue.position
	}
    });
})

function forwardPhoto(photoElement) {
    const currentImagePosition = images.filter(
	image => image.link == photoElement.src)[0].position;

    function nextPhoto(nextImagePosition) {
	if (nextImagePosition > largestPosition) {
	    nextImagePosition = 0;
	}
	const image = images.filter(image => nextImagePosition == image.position);
	if (image.length) {
	    photoElement.src = image[0].link;
	} else {
	    nextPhoto(nextImagePosition + 1)
	}
    }
    
    nextPhoto(currentImagePosition + 1);
}

backArrow.addEventListener("click", () => backPhoto(
    document.getElementById("main-photo")));
backArrow.addEventListener("click", () => backPhoto(
    document.getElementById("display-photo-1")));
backArrow.addEventListener("click", () => backPhoto(
    document.getElementById("display-photo-2")));

function backPhoto(photoElement) {
    const currentImagePosition = images.filter(
	image => image.link == photoElement.src)[0].position;
    
    function previousPhoto(previousImagePosition) {
	if (previousImagePosition < 0) {
	    previousImagePosition = largestPosition;
	}
	const image = images.filter(
	    image => previousImagePosition == image.position);
	if (image.length) {
	    photoElement.src = image[0].link;
	} else {
	    previousPhoto(previousImagePosition - 1)
	}

    }

    previousPhoto(currentImagePosition - 1)
}

function setHeading(details) {
    const heading = document.getElementById("heading");
    heading.textContent = details.Heading;
}

function setTitle(details) {
    const title = document.querySelector("title");
    if (!title.textContent.includes("Glass Spades")) {
	title.textContent = `Glass Spades | ${details.Heading}`
    }
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
    fragment.append(createSection("Location Name", details["Location Name"]));
    if (details.Category == "Land" || details.Category == "Apartment") {
	fragment.append(createSection("Size", details.Size));
	fragment.append(createSection("Unit Type", details["Unit Type"]));
	if (details.Category == "Apartment") {
	    fragment.append(createSection("Bedrooms", details.Bedrooms));
	    fragment.append(createSection("Bathrooms", details.Bathrooms));
	    fragment.append(createSection("Internal Features",
					  details["Internal Features"]));
	}
    } else {
	fragment.append(createSection("Bedrooms", details.Bedrooms));
	fragment.append(createSection("Bathrooms", details.Bathrooms));
	fragment.append(createSection("Internal Features",
				      details["Internal Features"]));
    }
    fragment.append(createSection("External Features",
				  details["External Features"]));
    fragment.append(createSection("Price", price));
    
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
    section.id = name;
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
	xhr.open("GET", "/api/login/checkLogin");
	xhr.send()

	xhr.onreadystatechange = function() {
	    if (this.readyState == 4) {
		resolve(this.response)
	    }
	}
    })
}

const form = document.querySelector("form");
form.addEventListener("submit", handleForm)

function handleForm(event) {
    event.preventDefault();

    dataLayer.push({ "event": "generate_lead" })

    const formdata = new FormData(form);
    formdata.append("link", location.href);
    formdata.append("createdDate", Date.now());

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/listing/handleLeadInfo");
    xhr.send(formdata);

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    if (this.response == "success") {
		const loadingPage = document.getElementById("loading-page");
		loadingPage.style.display = "none";
		const snackbar = document.getElementById("snackbar-success");
		snackbar.style.display = "block";
		snackbar.classList.add("slide");
		snackbar.addEventListener("animationend", (event) => {
		    event.target.style.display = "none";
		})
	    } else {
		const snackbar = document.getElementById("snackbar-error");
		snackbar.style.display = "block";
		snackbar.classList.add("slide");
		snackbar.addEventListener("animationend", (event) => {
		    event.target.style.display = "none";
		})
	    }
	}
    }

    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "flex";
}

function createThumbnail(images) {
    const [ first ] = images.filter(image => image.position == 0);
    const thumbnailEl = document.querySelector("meta[name='thumbnail']");
    thumbnailEl.content = first.link;
}

function createWhatsappText() {
    const whatsapp = document.getElementById("whatsapp");
    whatsapp.href += `Hi,%20I%20am%20interested%20in%20the%20property%20in%20the%20link:%20${location.href}`
}

function setOGElements(details) {
    setOGTitle(details.Heading);
    setOGUrl();
    // setImage();
}

function setOGTitle(heading) {
    const title = document.querySelector("meta[name='og:title']")
    title.content = heading
}

function setOGUrl() {
    const url = document.querySelector("meta[name='og:url']");
    url.content = location.href;
}

function setImage() {
    const image = document.querySelector("meta[name='og:image']");
    const allImages = JSON.parse(sessionStorage.getItem("images"));
    const [ overview ] = allImages.filter(imageObj => imageObj.position == 0);
    image.content = overview.link;
}

const closeIcon = document.getElementById("close-icon");
closeIcon.addEventListener("click", () => {
    const imageEl = document.getElementById("images");
    if (imageEl.classList.contains("overlay")) {
	imageEl.classList.remove("overlay");
	closeIcon.style.display = "none";

	const next1 = document.getElementById("display-photo-1");
	const next2 = document.getElementById("display-photo-2");
	next1.style.display = "block";
	next2.style.display = "block";
    }
})

async function showAuthDetails() {
    if (navigator.userAgent != "glassspades-headless-chromium") {
	const loginStatus = await confirmLogin();
	const page = document.querySelector(".page");
	if (loginStatus == "verified") {
	    const details  = JSON.parse(sessionStorage.getItem("details"));
	    const coordinates = [details.Location.coordinates[1],
				 details.Location.coordinates[0]]
	    page.insertBefore(createSection("Location", coordinates),
			      document.querySelector("form"));

	    page.insertBefore(createSection("Development", details.Development),
			      document.querySelector("form"))
	}
    }
}

function getRelatedListings() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/listing/getRelatedListings");
    xhr.send(JSON.stringify({ id: retrieveListingId() }));

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    if (this.response != "fail") {
		// if there are related listings
		const relatedListings = JSON.parse(this.response);
		displayHouseDetails(relatedListings, "related")
	    }
	}
    }
}
