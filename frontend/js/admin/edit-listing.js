import { 
    startImageDrag, 
    dragOverImage,
	dropImage, 
    setData,
    highlightImage 
} from "./upload-listing.js";
import { showLoadingPage, checkLogin } from "../general.js";

if (navigator.userAgent != "glassspades-headless-chromium") {
    checkLogin();
    window.addEventListener("DOMContentLoaded", retrieveListing);
}

let listingData;
// window.addEventListener("DOMContentLoaded", retrieveListing);

function retrieveListing() {
    const url = new URL(location);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/edit-listing/retrieveListing");
    xhr.send(url.searchParams.get("id"));

    xhr.onreadystatechange = function() {
	    if (this.readyState == 4) {
	        if (this.response != "fail") {
	    	    const data = JSON.parse(this.response);
	    	    console.log(data)
	    	    listingData = data.listing;
	    	    handleListing(data.listing);
	    	    displayImages(data.listingImages);
	    	    processCategory(data.listing);
	        }
	    }
    }
}

function handleListing(listing) {
    const keys = Object.keys(listing);
    keys.forEach(key => {
	    if (key == "_id" || key == "__v") {
	        return ;
	    } else if (Array.isArray(listing[key])) {
	        enterArrayData(key, listing[key]);
	    } else if (
            ["Heading", "Description", "Price", "Size", "Development"].includes(key)
        ) {
	        enterTypedData(key, listing[key]);
	    } else if (key == "Location") {
	        if (listing[key].coordinates.length) {
	    	    const coords = listing.Location.coordinates;
	    	    const event = new Event("coords", { bubble: false })
	    	    sessionStorage.setItem("Latitude", coords[1]);
	    	    sessionStorage.setItem("Longitude", coords[0]);
	    	    document.dispatchEvent(event);
	        }
	    } else {
	        enterData(key, listing[key])
	    }
	
    });
}

function enterData(key, value) {
    const element = document.querySelector(`[name="${key}"][value="${value}"]`);
    if (element) element.classList.add("clicked-button");
}

function enterTypedData(key, value) {
    const element = document.querySelector(`[name=${key}]`);
    element.value = value;
}

function enterArrayData(key, values) {
    values.forEach(value => {
	    const element = document.querySelector(`[name="${key}"][value="${value}"]`);
        if (element) element.classList.add("clicked-button");
    })
}

function processCategory(listing) {
    if (listing.Category == "Apartment") {
	    const description = document.getElementById("Development-container");
	    const size = document.getElementById("Size-container");
	    const unitType = document.getElementById("Unit-Type-container");
	    description.style.display = "grid";
	    size.style.display = "grid";
	    unitType.style.display = "grid";
    }
}

function displayImages(listingImages) {
    const fragment = new DocumentFragment();
    const dropZone = document.getElementById("drop-zone");
    const imageArr = sortByPosition(listingImages);

    for (let i = 0; i < imageArr.length; i++) {
	    fragment.append(displayImage(imageArr[i]));
    }
    dropZone.append(fragment);
}

function sortByPosition(listingImages) {
    const imagePositions = listingImages.map(image => image.position);
    imagePositions.sort((a, b) => a - b);
    const sortedImages = imagePositions.map(imagePosition =>
	    listingImages.filter(image => image.position == imagePosition)[0]
    )
    return sortedImages
}

function displayImage(image) {
    const img = document.createElement("img");
    img.src = image.link;
    img.id = image._id;
    img.classList.add("images");

    img.addEventListener("dragstart", startImageDrag);
    img.addEventListener("dragover", dragOverImage);
    img.addEventListener("drop", dropImage);
    img.addEventListener("click", highlightImage);

    return img
}

window.addEventListener("DOMContentLoaded", () => {
    const submit = document.getElementById("submit");
    submit.removeEventListener("click", setData);
    submit.addEventListener("click",  organizeData);
})

async function organizeData() {
    let formdata = new FormData();
    const clickedButtons = document.querySelectorAll(".clicked-button");
    showLoadingPage();
    
    clickedButtons.forEach(clickedButton => {
	    if (
            clickedButton.name == "External Features" ||
	        clickedButton.name == "Internal Features"
        ) {
	        formdata.append(clickedButton.name, clickedButton.value)
	    } else {
	        formdata.set(clickedButton.name, clickedButton.value);
	    }
    })

    handleTypedData(formdata);
    formdata.set("id", listingData._id);
    handleCoordinates(formdata);
    await handleFiles(formdata);

    updateListing(formdata);
}
function handleCoordinates(formdata) {
    formdata.set("Latitude", sessionStorage.getItem("Latitude"));
    formdata.set("Longitude", sessionStorage.getItem("Longitude"))
}

function handleTypedData(formdata) {
    const typedNames = ["Heading", "Description", "Price", "Size", "Development"];
    typedNames.forEach(typedName => {
	    const element = document.querySelector(`[name=${typedName}]`);
	    formdata.set(element.name, element.value)
    })
}

async function handleFiles(formdata) {
    const dropZone = document.getElementById("drop-zone");
    const filesInfo = [];

    for (let i = 0; i < dropZone.childElementCount; i++) {
	// JSON is not working so use querystring instead
	    const name = `name=${dropZone.children[i].id}&position=${i}`;
	    if (!dropZone.children[i].id.includes("-")) {
	        formdata.append("fileId", name)
	    } else {
	        filesInfo.push({ src: dropZone.children[i].src, name })
	    }
    }

    const files = await Promise.all(filesInfo.map(info => createFileObject(info)));
    files.forEach(file => formdata.set(file.name, file.data));

    formdata.set("fileNumber", files.length)

    return formdata
}

function createFileObject(fileData) {
    return new Promise((resolve, reject) => {
	    const xhr = new XMLHttpRequest();
	    xhr.open("GET", fileData.src)
	    xhr.responseType = "blob";
	    xhr.send();

	    xhr.onreadystatechange = function() {
	        if (this.readyState == 4) {
	    	    resolve({ name: fileData.name, data: this.response})
	        }
	    }
    })
}
function updateListing(formdata) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/edit-listing/updateListing");
    xhr.send(formdata);

    xhr.onreadystatechange = function() {
	    if (this.readyState == 4) {
	        if (this.response == "success") {
	    	    location.href = "/admin/listings";
	        }
	    }
    }
}