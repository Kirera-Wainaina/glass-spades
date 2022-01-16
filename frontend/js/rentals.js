import {
    displayHouseDetails, displayFilterBanner, runFilter,
    generateTitle, closeElements
} from "./general.js"

getRentals();
replaceTitle();

function getRentals() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/rentals/getRentals${location.search}`);
    xhr.send();

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    if (this.response != "fail") {
	    // if (this.response == "fail") {
		const rentalDetails = JSON.parse(this.response);
		sessionStorage.setItem("rentals", this.response);
		displayHouseDetails(rentalDetails);
	    } else {
		const noListings = document.getElementById("no-listings");
		noListings.style.display = "block";
	    }
	}
    }
}

const filterIcon = document.getElementById("filter-icon");
filterIcon.addEventListener("click", displayFilterBanner);

const closeIcon = document.getElementById("close-icon");
closeIcon.addEventListener("click", () => closeElements(
    document.getElementById("filter-container"),
    document.getElementById("filter-card")));

const filterButton = document.getElementById("filter-button");
filterButton.addEventListener("click", () => runFilter("rentals"))

function replaceTitle() {
    const title = generateTitle();
    if (title) {
	const titleEl = document.querySelector("h2");
	titleEl.textContent = title;
    }
}
