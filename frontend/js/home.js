import { displayHouseDetails } from "./general.js";
getListings()

function getListings() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/home/getListings")
    xhr.send();

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    const houseDetails = JSON.parse(this.response);
	    displayHouseDetails(houseDetails);
	}
    }
}
