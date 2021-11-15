import {
    displayHouseDetails, displayFilterBanner, closeFilterBanner, runFilter
} from "./general.js"

getRentals();

function getRentals() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/rentals/getRentals");
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
closeIcon.addEventListener("click", closeFilterBanner)

const filterButton = document.getElementById("filter-button");
filterButton.addEventListener("click", () => runFilter("rentals"))
