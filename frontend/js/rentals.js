import { displayHouseDetails } from "./home.js"
getRentals();

function getRentals() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/rentals/getRentals");
    xhr.send();

    xhr.onreadystatechange = function() {
	if (this.readyState == 4 && this.response != "fail") {
	    const rentalDetails = JSON.parse(this.response);
	    displayHouseDetails(rentalDetails);
	}
    }
}
