import { displayHouseDetails } from "./general.js"
import { displayFilterBanner } from "./rentals.js"
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
