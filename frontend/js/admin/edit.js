import { startImageDrag, dragOverImage,
	 dropImage, setData,
	 getImages, confirmValues } from "./upload.js";
import { showLoadingPage } from "../general.js";

let listingData;
window.addEventListener("DOMContentLoaded", retrieveListing);

function retrieveListing() {
    const url = new URL(location);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/edit/retrieveListing");
    xhr.send(url.searchParams.get("id"));

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    if (this.response != "fail") {
		const data = JSON.parse(this.response);
		console.log(data)
		listingData = data.listing;
		handleListing(data.listing);
		displayImages(data.listingImages);
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
	} else if (key == "Heading" || key == "Description" || key == "Price") {
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
    const element = document.querySelector(`[name=${key}][value="${value}"]`);
    element.classList.add("clicked-button");
}

function enterTypedData(key, value) {
    const element = document.querySelector(`[name=${key}]`);
    element.value = value;
}

function enterArrayData(key, values) {
    values.forEach(value => {
	const element = document.querySelector(`[name="${key}"][value="${value}"]`);
	element.classList.add("clicked-button");
    })
}

function displayImages(listingImages) {
    const fragment = new DocumentFragment();
    const dropZone = document.getElementById("drop-zone");
    for (let i = 0; i < listingImages.length; i++) {
	const image = listingImages.filter(img => img.position == i)[0]
	if (image) {
	    fragment.append(displayImage(image));
	}
    }
    dropZone.append(fragment);
}

function displayImage(image) {
    const img = document.createElement("img");
    img.src = image.link;
    img.id = image._id;
    img.classList.add("images");

    img.addEventListener("dragstart", startImageDrag);
    img.addEventListener("dragover", dragOverImage);
    img.addEventListener("drop", dropImage);

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
	if (clickedButton.name == "External Features"
	    || clickedButton.name == "Internal Features") {
	    formdata.append(clickedButton.name, clickedButton.value)
	} else {
	    formdata.set(clickedButton.name, clickedButton.value);
	}
    })

    handleTypedData(formdata);
    formdata.set("id", listingData._id);
    handleCoordinates(formdata);
    await handleFiles(formdata);

    if (confirmValues(formdata)) {
	updateListing(formdata);
    }
}
function handleCoordinates(formdata) {
    formdata.set("Latitude", sessionStorage.getItem("Latitude"));
    formdata.set("Longitude", sessionStorage.getItem("Longitude"))
}

function handleTypedData(formdata) {
    const typedNames = ["Heading", "Description", "Price"];
    typedNames.forEach(typedName => {
	const element = document.querySelector(`[name=${typedName}]`);
	formdata.set(element.name, element.value)
    })
}

async function handleFiles(formdata) {
    const dropZone = document.getElementById("drop-zone");
    const filesInfo = [];

    for (let i = 0; i < dropZone.childElementCount; i++) {
	const name = JSON.stringify({ name: dropZone.children[i].id, position: i })
	if (!dropZone.children[i].id.includes("-")) {
	    formdata.append("fileId", name)
	} else {
	    filesInfo.push({ src: dropZone.children[i].src, name })
	}
    }

    const files = await Promise.all(
	filesInfo.map(info => createFileObject(info)));
    files.forEach(file => formdata.set(file.name, file.data));

    formdata.set("imageNum", files.length)

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
    xhr.open("POST", "/api/admin/edit/updateListing");
    xhr.send(formdata);

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    if (this.response == "success") {
		location.href = "/admin/listings";
	    }
	}
    }
}
