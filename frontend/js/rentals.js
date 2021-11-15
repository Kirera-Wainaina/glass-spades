import {
    displayHouseDetails, displayFilterBanner, closeFilterBanner, runFilter
} from "./general.js"

getRentals();

(function (){
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/admin/upload/sendModelData");
    xhr.send()

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    const model = JSON.parse(this.response);
	    const locationNames = model["Location Name"];
	    const locationElement = document.getElementById("locations");
	    const fragment = new DocumentFragment();
	    locationNames.forEach(locationName => {
		const option = document.createElement("option");
		option.value = locationName;
		option.textContent = locationName;
		fragment.append(option)
	    })
	    locationElement.appendChild(fragment);
	}
    }
})()

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
