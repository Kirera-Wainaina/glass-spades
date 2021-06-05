getListingDetails();
getListingImages();

function retrieveListingId() {
    const url = new URL(location);
    const params = new URLSearchParams(url.search);
    return params.get("id")
}

function getListingDetails() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/listing/getListingDetails");
    xhr.send(JSON.stringify({ id: retrieveListingId() }));

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    console.log(this.response)
	}
    }
}

function getListingImages() {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/listing/getListingImages");
    xhr.send(JSON.stringify({ id: retrieveListingId() }));

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    console.log(this.response)
	}
    }
}
