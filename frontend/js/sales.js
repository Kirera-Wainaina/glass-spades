import { toggleElementClass } from "./general.js";
import { displayHouseDetails } from "./listing-utils.js";
import { displayFilterBanner, runFilter, generateFilterPageTitle } from "./filter-utils.js";


document.addEventListener("DOMContentLoaded", () => {
	getSales();
	replaceTitle()
	
	const filterIcon = document.getElementById("filter-icon");
	filterIcon.addEventListener("click", displayFilterBanner);

	const filterShortcut = document.getElementById("filter-shortcut");
	filterShortcut.addEventListener("click", displayFilterBanner);

	const closeIcon = document.getElementById("close-icon");
	closeIcon.addEventListener("click", () => {
		toggleElementClass(document.getElementById("filter-container"), "hide");
	})

	const filterButton = document.getElementById("filter-button");
	filterButton.addEventListener("click", () => runFilter("sales"))
})
function getSales() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/api/sales/getSales${location.search}`);
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


function replaceTitle() {
    const title = generateFilterPageTitle();
    if (title) {
			const titleEl = document.querySelector("h1");
			titleEl.textContent = title;
    }
}