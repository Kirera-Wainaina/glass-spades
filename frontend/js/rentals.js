import { displayHouseDetails } from "./general.js"
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
filterIcon.addEventListener("click", event => {
    const filterContainer = document.getElementById("filter-container");
    const filterCard = document.getElementById("filter-card");
    filterContainer.style.display = "block";
    filterCard.style.display = "grid";    
});

const closeIcon = document.getElementById("close-icon");
closeIcon.addEventListener("click", () => {
    const filterContainer = document.getElementById("filter-container");
    const filterCard = document.getElementById("filter-card");
    filterContainer.style.display = "none";
    filterCard.style.display = "none";    
});

const filterButton = document.getElementById("filter-button");
filterButton.addEventListener("click", () => {
    const maxPrice = document.getElementById("max-price");
    const minPrice = document.getElementById("min-price");
    const rentals = JSON.parse(sessionStorage.getItem("rentals"));
    const filtered = rentals.filter(rental =>
	rental.price >= minPrice.value && rental.price <= maxPrice.value);
    console.log(filtered)

    if (filtered.length) {
	sessionStorage.setItem("filtered", JSON.stringify(filtered));
	const listings = document.getElementById("listings");
	while (listings.childElementCount != 0) {
	    listings.removeChild(listings.children[listings.childElementCount - 1])
	}
	// the function below only works if the listings element is empty
	displayHouseDetails(filtered);
    } else {
	const noListings = document.getElementById("no-listings");
	noListings.style.display = "block";
    }
});
