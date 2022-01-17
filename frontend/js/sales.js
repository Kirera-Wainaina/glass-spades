import {
    displayHouseDetails, displayFilterBanner, runFilter,
    generateTitle, closeElements
} from "./general.js"

getSales();
replaceTitle()

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

const filterIcon = document.getElementById("filter-icon");
filterIcon.addEventListener("click", displayFilterBanner);

const filterShortcut = document.getElementById("filter-shortcut");
filterShortcut.addEventListener("click", displayFilterBanner);

const closeIcon = document.getElementById("close-icon");
closeIcon.addEventListener("click", () => closeElements(
    document.getElementById("filter-container"),
    document.getElementById("filter-card")));

const filterButton = document.getElementById("filter-button");
filterButton.addEventListener("click", () => runFilter("sales"))

function replaceTitle() {
    const title = generateTitle();
    if (title) {
	const titleEl = document.querySelector("h2");
	titleEl.textContent = title;
    }
}

const shortcuts = document.getElementById("shortcuts-card");
