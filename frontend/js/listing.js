getListingDetails();

function getListingDetails() {
    const url = new URL(location);
    const params = new URLSearchParams(url.search);
    
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/listing/getListingDetails")
    xhr.send(JSON.stringify({ id: params.get("id") }))

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    console.log(JSON.parse(this.response))
	}
    }
}
