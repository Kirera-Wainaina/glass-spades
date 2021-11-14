import { displayHouseDetails } from "./general.js"
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
// filterIcon.addEventListener("click", event => {
//     const filterContainer = document.getElementById("filter-container");
//     const filterCard = document.getElementById("filter-card");
//     filterContainer.style.display = "block";
//     filterCard.style.display = "grid";    
// });

filterIcon.addEventListener("click", displayFilterBanner);
export function displayFilterBanner() {
    const filterContainer = document.getElementById("filter-container");
    const filterCard = document.getElementById("filter-card");
    filterContainer.style.display = "block";
    filterCard.style.display = "grid";    
}

const closeIcon = document.getElementById("close-icon");
closeIcon.addEventListener("click", () => {
    const filterContainer = document.getElementById("filter-container");
    const filterCard = document.getElementById("filter-card");
    filterContainer.style.display = "none";
    filterCard.style.display = "none";    
});

const filterButton = document.getElementById("filter-button");
filterButton.addEventListener("click", () => {
    const rentals = JSON.parse(sessionStorage.getItem("rentals"));
    const priceResults = filterByPrice(rentals);
    const bedroomResults = filterByBedrooms(priceResults);
    const locationResults = filterByLocation(bedroomResults);

    // the final list should be the variable 'filtered'
    let filtered = locationResults;

    displayResults(filtered)
    closeIcon.click();
});

function filterByPrice(listings) {
    const maxPrice = document.getElementById("max-price");
    const minPrice = document.getElementById("min-price");
    const displayedNotices = document.querySelectorAll(".filter-notice");

    for (let i = 0; i < displayedNotices.length; i++) {
	displayedNotices[i].style.display = "none";
    }
    
    if (minPrice.value == "" || maxPrice.value == "") {
	const notice = document.getElementById("no-price-filter");
	notice.style.display = "block";
	return listings
    } else if (maxPrice.value < minPrice.value) {
	const notice = document.getElementById("wrong-entry");
	notice.style.display = "block";
	return listings
    } else {
	const filtered = listings.filter(listing =>
	    listing.price >= minPrice.value && listing.price <= maxPrice.value);
	return filtered
    }
}

function filterByBedrooms(listings) {
    const bedrooms = document.getElementById("bedrooms");
    if (bedrooms.value == "") {
	return listings
    } else {
	const filtered = listings.filter(listing => {
	    if (bedrooms.value == 6) {
		// look for a listing with more than 5 bedrooms
		return listing.bedrooms > 5;
	    } else {
		return listing.bedrooms == bedrooms.value;
	    }
	});
	return filtered
    }
}

function filterByLocation(listings) {
    const locations = document.getElementById("locations");
    if (locations.value == "") {
	return listings
    } else {
	const filtered = listings.filter(listing => {
	    return listing.locationName == locations.value;
	})
	return filtered
    }
}

function displayResults(results) {
    const listings = document.getElementById("listings");
    if (results.length) {
	while (listings.childElementCount != 0) {
	    listings.removeChild(listings.children[listings.childElementCount - 1])
	}
	// the function below only works if the listings element is empty
	displayHouseDetails(results);
    } else {
	listings.parentNode.removeChild(listings);
	const noListings = document.getElementById("no-listings");
	noListings.style.display = "block";
    }

}
