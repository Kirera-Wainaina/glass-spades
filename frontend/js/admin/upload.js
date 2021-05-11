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

const containerList = document.getElementsByClassName("container");
for (let i = 0; i < containerList.length; i++) {
    containerList[i].addEventListener("click", (event) => {
	console.log(`${event.target.name}: ${event.target.value}`)
    })
}

const page = document.querySelector(".page");
page.addEventListener("click", (event) => {
    console.log(`${event.target.name}: ${event.target.value}`)
})
