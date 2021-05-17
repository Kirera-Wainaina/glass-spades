var houseInfo = {};

window.addEventListener("load", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload/sendModelData");
    xhr.send();

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    const model = JSON.parse(this.response);
	    constructPage(model);

	}
    }
});

function constructPage(model) {
    const containerFragment = createContainers(model);
    const parentContainer = document.querySelector(".page");
    const fileUpload = document.getElementById("file-upload");

    parentContainer.insertBefore(containerFragment, fileUpload);
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

const portraitUpload = document.getElementById("portrait-upload");
portraitUpload.addEventListener("click", event => {
    const fileInput = document.getElementById("invisible-portrait-upload");
    fileInput.click();
})

const portraitInput = document.getElementById("invisible-portrait-upload");
portraitInput.addEventListener("change", (event) => {
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
    img.src = url;
    img.alt = image.name;
    img.classList.add("images");
    img.id = Math.random();
    img.name = "landscape";

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
