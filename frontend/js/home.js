import { displayHouseDetails } from "./listing-utils.js";
getListings()

function getListings() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/home/getListings")
    xhr.send();

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    const houseDetails = JSON.parse(this.response);
	    displayHouseDetails(houseDetails);
	}
    }
}

const offerContainer = document.querySelector("#offer-container");
for (let i = 0; i < offerContainer.childElementCount; i++) {
    offerContainer.children[i]
	.addEventListener("animationend", handleNextAnimation)
}

function handleNextAnimation(event) {
    const el = event.target;
    el.classList.remove("offer-animation");
    if (el.nextElementSibling) {
	el.nextElementSibling.classList.add("offer-animation");
    } else {
	el.parentNode.firstElementChild.classList.add("offer-animation");
    }
}
