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
    filterCard.style.display = "block";    
});

const closeIcon = document.getElementById("close-icon");
closeIcon.addEventListener("click", () => {
    const filterContainer = document.getElementById("filter-container");
    const filterCard = document.getElementById("filter-card");
    filterContainer.style.display = "none";
    filterCard.style.display = "none";    
});
