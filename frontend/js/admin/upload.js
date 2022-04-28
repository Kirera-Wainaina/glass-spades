import { showLoadingPage, hideLoadingPage, checkLogin } from "../general.js"

if (navigator.userAgent != "glassspades-headless-chromium") {
    checkLogin();
}

var houseInfo = {};
var highlightedImages = [];

(async function() {
    const model = await getModelData();
    sessionStorage.setItem("model", model);
    if (!document.getElementById("Mandate-container")) {
	constructPage(JSON.parse(model));
    }
})()

function getModelData() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload/sendModelData");
    xhr.send();

    return new Promise((resolve, reject) => {
	xhr.onreadystatechange = function() {
	    if (this.readyState == 4) {
		const model = this.response;
		resolve(model)
	    }
	}
    })
}

function constructPage(model) {
    const containerFragment = createContainers(model);
    const parentContainer = document.querySelector(".page");
    const map = document.getElementById("map");

    parentContainer.insertBefore(containerFragment, map);
}    

function createContainers(model) {
    const keys = Object.keys(model);
    const fragment = new DocumentFragment();
    keys.forEach(key => {
	const div = document.createElement("div");
	div.id = `${key}-container`.replaceAll(" ", "-");
	div.classList.add("container");
	div.appendChild(createLabel(key));
	if (key == "Size" || key == "Unit Type") {
	    if (key == "Unit Type") {
	    div.appendChild(createButtons(key, model[key]));
	    } else {
		div.appendChild(createInput("number", "Size"));
	    }
	    div.style.display = "none";
	} else if (key == "Development") {
	    div.appendChild(createInput("text", "Development"));
	    div.style.display = "none";
	} else {
	    div.appendChild(createButtons(key, model[key]));
	}

	fragment.append(div)
    })
    return fragment
}

function createLabel(key) {
    const p = document.createElement("p");
    p.classList.add("label");
    p.id = `${key}-label`.replaceAll(" ", "-");
    p.innerText = key;
    return p
}

function createButtons(key, data) {
    const fragment = new DocumentFragment();
    data.forEach(type => {
	const button = document.createElement("button");
	button.value = type;
	button.type = "button";
	button.name = key;
	button.innerText = type
	fragment.appendChild(button);
    })
    return fragment
}

function createInput(type, name) {
    const input = document.createElement("input");
    input.type = type;
    input.name = name;
    return input
}

window.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".page");
    page.addEventListener("click", addDataToHouseInfo);
    page.addEventListener("click", changeButtonColorOnClick);
})
function addDataToHouseInfo(event) {
   // add or remove from house info
    const element = event.target;
    
    if (element.tagName == "BUTTON") {
	if (element.name == "Mandate" || element.name == "Category"
	    || element.name == "Bedrooms" || element.name == "Bathrooms"
	    || element.name == "Unit Type" || element.name == "Location Name")
	{
	    // The properties that are ENUMS
	    houseInfo[element.name] = element.value;
	} else if (element.name == "External Features"
		   || element.name == "Internal Features") {
	    // these keys can hold more than one value
	    if (houseInfo[element.name]
		&& houseInfo[element.name].includes(element.value)) {
		//remove that element from the array and change the color
		const index = houseInfo[element.name].indexOf(element.value);
		houseInfo[element.name].splice(index, 1);
	    } else if (houseInfo[element.name]) {
		houseInfo[element.name].push(element.value)
	    } else {
		houseInfo[element.name] = [element.value];
	    }
	}
    }

}


function changeButtonColorOnClick(event) {
    // change the colors of the buttons when clicked
    const element = event.target;

    if (element.tagName == "BUTTON") {
	if (element.name == "Mandate" || element.name == "Category"
	    || element.name == "Bedrooms" || element.name == "Bathrooms"
	    || element.name == "Unit Type" || element.name == "Location Name")
	{
	    // only one element can be colored
	    const buttons = document
		  .querySelectorAll(`button[name="${element.name}"]`);
	    // remove the coloring for all buttons in one category
	    buttons.forEach(button => {
		if (button.classList.contains("clicked-button")) {
		    button.classList.remove("clicked-button");
		};
	    })
	    element.classList.add("clicked-button");
	} else if (element.name == "External Features"
		   || element.name == "Internal Features") {
	    element.classList.contains("clicked-button") ?
		element.classList.remove("clicked-button") :
		element.classList.add("clicked-button")
	}
    }
}


window.addEventListener("DOMContentLoaded", () => {
    const fileUpload = document.getElementById("file-upload");
    fileUpload.addEventListener("click", event => {
	const fileInput = document.getElementById("invisible-file-upload");
	fileInput.click();
    })

    const fileInput = document.getElementById("invisible-file-upload");
    fileInput.addEventListener("change", (event) => {
	const files = event.target.files;
	const fragment = new DocumentFragment();
	const dropZone = document.getElementById("drop-zone");

	for(let i = 0; i < files.length; i++) {
	    fragment.append(displayImage(files[i]));
	}

	dropZone.appendChild(fragment);
    });

});


window.addEventListener("DOMContentLoaded", () => {
    const dropZone = document.getElementById("drop-zone");
    dropZone.addEventListener("dragover", event => {
	event.preventDefault();
	event.dataTransfer.dropEffect = "move";
    })

    dropZone.addEventListener("drop", event => {
	event.preventDefault();
	const fragment = new DocumentFragment();
	
	const files = event.dataTransfer.files;
	for(let i = 0; i < files.length; i++) {
	    fragment.append(displayImage(files[i]));
	}
	dropZone.appendChild(fragment);
    })
})

function displayImage(image) {
    const url = URL.createObjectURL(image);
    const img = document.createElement("img");
    const name = `${Date.now()}-${Math.trunc(Math.random() * 1e6)}-`;
    img.src = url;
    img.alt = image.name;
    img.classList.add("images");
    img.id = name;

    img.addEventListener("dragstart", startImageDrag);
    img.addEventListener("dragover", dragOverImage);
    img.addEventListener("drop", dropImage);
    img.addEventListener("click", highlightImage);

    return img
}

export function startImageDrag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

export function dragOverImage (event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

export function dropImage(event) {
    const draggedImgId = event.dataTransfer.getData("text");
    const draggedImgElement = document.getElementById(draggedImgId);

    const dropImg = event.target;

    dropImg.insertAdjacentElement("beforebegin", draggedImgElement);
}

function highlightImage(event) {
    const el = event.target;
    if (el.classList.contains("clicked")) {
	el.classList.remove("clicked");
	const index = highlightedImages.indexOf(el.id);
	highlightedImages.splice(index, 1);
    } else {
	el.classList.add("clicked");
	highlightedImages.push(el.id)
    }
    console.log(highlightedImages)
}


window.addEventListener("DOMContentLoaded", () => {
    const submit = document.getElementById("submit");
    submit.addEventListener("click", setData);
})

export async function setData(event) {
    const formdata = new FormData();

    const heading = document.querySelector("input[name='Heading']");
    const description = document.querySelector("textarea");
    const price = document.querySelector("input[name='Price']");
    const size = document.querySelector("input[name='Size']");
    const development = document.querySelector("input[name='Development']");

    houseInfo[heading.name] = heading.value;
    houseInfo[description.name] = description.value;
    houseInfo[price.name] = price.value;

    if (houseInfo.Category == "Land") {
	houseInfo[size.name] = size.value;
    } else if (houseInfo.Category == "Apartment") {
	houseInfo[size.name] = size.value;
	houseInfo[development.name] = development.value;
    }

    if (sessionStorage.getItem("Latitude")) {
	houseInfo["Latitude"] = sessionStorage.getItem("Latitude");
	houseInfo["Longitude"] = sessionStorage.getItem("Longitude");
    }
    
    Object.keys(houseInfo).forEach(key => {
	if (Array.isArray(houseInfo[key])) {
	    houseInfo[key].forEach(value => formdata.append(key, value));
	} else {
	    formdata.set(key, houseInfo[key])
	}
    })

    const images = await getImages();
    formdata.set("imageNum", images.length);
    
    images.forEach((image, index) => {
	let name = `${Date.now()}-${Math.trunc(Math.random() * 1e6)}-`;
	formdata.set(name + index, image)
    })

    if (confirmValues(formdata)) {
	submitData(formdata);
    }
}

function submitData(formdata) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload/uploadListing");
    xhr.send(formdata);

    xhr.onreadystatechange = function() {
	if(xhr.readyState == 4) {
	    hideLoadingPage();
	    location.href="/admin/home";
	}
    }
}

export function getImages() {
    const dropZone = document.getElementById("drop-zone");
    const imageElements = dropZone.children;
    const imgSrcs = []
    
    for(let i = 0; i < imageElements.length; i++) {
	const imageElement = imageElements[i];
	imgSrcs.push(imageElement.src);
    }

    return new Promise((resolve, reject) => {
	Promise.all(imgSrcs.map(src => getBlobFromImgSrc(src)))
	    .then(files => resolve(files))
	    .catch(error => reject(error))
    })
}

function getBlobFromImgSrc(src) {
    return new Promise ((resolve, reject) => {
	const xhr = new XMLHttpRequest();
	xhr.open("GET", src);
	xhr.responseType = "blob";
	xhr.send()

	xhr.onreadystatechange = function() {
	    if (this.readyState == 4) {
		resolve(this.response)
	    }
	}

	xhr.onerror = function() {
	    reject(error)
	}
    })
}

export function confirmValues(formdata) {
    const model = JSON.parse(sessionStorage.getItem("model"));
    const keys = Object.keys(model);
    const otherKeys = ["Heading", "Description", "Price", "Longitude", "imageNum"];
    let allKeys = keys.concat(otherKeys);
    const blanks = [];

    allKeys = reviseKeys(allKeys, formdata.get("Category"))
    
    allKeys.forEach(key => {
	if (!formdata.get(key)) {
	    blanks.push(key);
	} else if (key == "imageNum") {
	    formdata.get(key) == 0 && blanks.push(key);
	}
    })

    if (blanks.length) {
	displayError(blanks)
	return false
    } else {
	showLoadingPage();
	return true
    }
}

function reviseKeys(allKeys, category) {
    // For land, dont check presence of house features
    if (category == "Land") {
	allKeys = allKeys.filter(key => {
	    return (key != "Internal Features" && key != "Bedrooms"
		    && key != "Bathrooms")
	})
    } else if (category == "Townhouse" || category == "Villa"){
	// for houses, don't check presence of land features
	allKeys = allKeys.filter(key => {
	    return (key != "Size" && key != "Unit Type")
	})
    }

    if (category != "Apartment") {
	// this if statement is separate so that it can also check the categories
	// in the above 2 if statements
	allKeys = allKeys.filter(key => key != "Development")
    }
    return allKeys
}

function displayError(blanks) {
    const emptyError = document.getElementById("empty-error");
    emptyError.textContent = "The following fields do not have values: "
    emptyError.style.display = "inline-block"
    blanks.forEach(key => {
	if (key == "imageNum") {
	    emptyError.textContent += "Images, ";
	} else if (key == "Longitude") {
	    emptyError.textContent += "Map Coordinates,  ";
	} else {
	    emptyError.textContent += `${key}, `;
	}
    })
    window.scrollTo(0, 0);
}

document.addEventListener("click", event => {
    const value = event.target.value;
    const bedrooms = document.getElementById("Bedrooms-container");
    const bathrooms = document.getElementById("Bathrooms-container");
    const internalFeatures = document
	  .getElementById("Internal-Features-container");
    const size = document.getElementById("Size-container");
    const unitType = document.getElementById("Unit-Type-container");
    const development = document.getElementById("Development-container");


    if (value == "Land") {
	bedrooms.style.display = "none";
	bathrooms.style.display = "none";
	internalFeatures.style.display = "none";
	size.style.display = "grid";
	unitType.style.display = "grid";
	development.style.display = "none";
    } else if (value == "Townhouse" || value == "Villa" || value == "Apartment") {
	bedrooms.style.display = "grid";
	bathrooms.style.display = "grid";
	internalFeatures.style.display = "grid";
	if (value == "Apartment") {
	    size.style.display = "grid";
	    unitType.style.display = "grid";
	    development.style.display = "grid";
	} else {
	    size.style.display = "none";
	    unitType.style.display = "none";
	    development.style.display = "none";
	}
    }
});
