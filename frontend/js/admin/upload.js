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
    parentContainer.appendChild(containerFragment)

    // Take footer to bottom position
    parentContainer.appendChild(document.querySelector("footer"))
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

    console.log(houseInfo)
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
