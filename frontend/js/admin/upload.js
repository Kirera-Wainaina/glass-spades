window.addEventListener("load", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload/sendModelData");
    xhr.send();

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    const model = JSON.parse(this.response);
	    createMandate(model["Mandate"]);
	}
    }
});

function createMandate(data) {
    const fragment = new DocumentFragment();
    data.forEach(type => {
	const button = document.createElement("button");
	button.value = type;
	button.type = "button";
	button.name = "mandate";
	button.innerText = type
	fragment.appendChild(button);
    })

    const mandateContainer = document.getElementById("mandate-container");
    mandateContainer.appendChild(fragment);
}
