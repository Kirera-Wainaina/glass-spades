import {
    displayHouseDetails, displayFilterBanner, closeFilterBanner, runFilter
} from "./general.js"

getSales();

function getSales() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/sales/getSales");
    xhr.send();

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    if (this.response != "fail") {
	    // if (this.response == "fail") {
		const salesDetails = JSON.parse(this.response);
		sessionStorage.setItem("sales", this.response);
		displayHouseDetails(salesDetails);
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
filterButton.addEventListener("click", () => runFilter("sales"))
