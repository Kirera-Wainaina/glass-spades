var houseInfo = {};

window.addEventListener("load", () => {
    if (!document.getElementById("Mandate-container")) {
	runPage();
    }
    if (!document.getElementById("map")) {
	appendMapsScript()
    }
});


function runPage() {
    if (!sessionStorage.getItem("model")) {
	const xhr = new XMLHttpRequest();
	xhr.open("POST", "/api/admin/upload/sendModelData");
	xhr.send();

	xhr.onreadystatechange = function() {
	    if (this.readyState == 4) {
		const model = JSON.parse(this.response);
		constructPage(model);
		sessionStorage.setItem("model", JSON.stringify(model));
	    }
	}
    } else {
	const model = JSON.parse(sessionStorage.getItem("model"));
	constructPage(model);
    }
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
	div.appendChild(createButtons(key, model[key]));
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

const page = document.querySelector(".page");
page.addEventListener("click", (event) => {
    // add or remove from house info
    const element = event.target;
    
    if (element.tagName == "BUTTON") {
	if (element.name == "Mandate" || element.name == "Category"
	    || element.name == "Bedrooms" || element.name == "Bathrooms")
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

})

page.addEventListener("click", (event) => {
    // change the colors of the buttons when clicked
    const element = event.target;

    if (element.tagName == "BUTTON") {
	if (element.name == "Mandate" || element.name == "Category"
	    || element.name == "Bedrooms" || element.name == "Bathrooms")
	{
	    // only one element can be colored
	    const buttons = document
		  .querySelectorAll(`button[name=${element.name}]`);
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
})

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

    return img
}

function startImageDrag(event) {
    event.dataTransfer.setData("text/plain", event.target.id);
}

function dragOverImage (event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

function dropImage(event) {
    const draggedImgId = event.dataTransfer.getData("text");
    const draggedImgElement = document.getElementById(draggedImgId);

    const dropImg = event.target;

    dropImg.insertAdjacentElement("beforebegin", draggedImgElement);
}

const submit = document.getElementById("submit");
submit.addEventListener("click", setData);

async function setData(event) {
    const formdata = new FormData();

    const heading = document.querySelector("input[name='Heading']");
    const description = document.querySelector("textarea");
    const price = document.querySelector("input[name='Price']");

    houseInfo[heading.name] = heading.value;
    houseInfo[description.name] = description.value;
    houseInfo[price.name] = price.value;
    
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
    // console.log(houseInfo)
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

function getImages() {
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

function showLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "flex";

}

function hideLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "none";
}

function appendMapsScript() {
    const head = document.querySelector("head");
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDrVByoterVaoQyeLZ_ZmFvDBHcJJInQ84&callback=initMap&libraries=&v=weekly";
    head.append(script)
}


function initMap() {
    const mapEl = document.getElementById("map");
    const nairobi = { lat: -1.230287, lng: 36.848492 };
    const map = new google.maps.Map(mapEl, {
	center: nairobi,
	zoom: 15
    })

    createMarker(map, nairobi);
}

function createMarker(map, position) {
    const marker = new google.maps.Marker({
	map,
	draggable: true,
	position
    });

    marker.addListener("dragend", (event) => {
	houseInfo["Latitude"] = event.latLng.lat();
	houseInfo["Longitude"] = event.latLng.lng();
    });
}

function confirmValues(formdata) {
    const model = JSON.parse(sessionStorage.getItem("model"));
    const keys = Object.keys(model);
    const otherKeys = ["Heading", "Description", "Price", "Longitude", "imageNum"];
    const allKeys = keys.concat(otherKeys);
    const blanks = [];

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
