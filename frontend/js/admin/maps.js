let marker, map;

window.addEventListener("load", () => {
    if (navigator.userAgent != "glassspades-headless-chromium") {
	appendMapsScript();
    }
})


function appendMapsScript() {
    const body = document.querySelector("body");
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDrVByoterVaoQyeLZ_ZmFvDBHcJJInQ84&callback=initMap&libraries=places&v=weekly";
    script.id = "google-maps-script";
    body.append(script)
}


function initMap() {
    const mapEl = document.getElementById("map");
    const nairobi = { lat: -1.230287, lng: 36.848492 };
    map = new google.maps.Map(mapEl, {
	center: nairobi,
	zoom: 15
    })

    map.addListener("click", event => {
	marker.setPosition(event.latLng)
	sessionStorage.setItem("Latitude", event.latLng.lat());
	sessionStorage.setItem("Longitude", event.latLng.lng());
    });

    createSearchBox();

    createMarker(map, nairobi);
}

function createMarker(map, position) {
    marker = new google.maps.Marker({
	map,
	draggable: true,
	position
    });

    marker.addListener("dragend", (event) => {
	sessionStorage.setItem("Latitude", event.latLng.lat());
	sessionStorage.setItem("Longitude", event.latLng.lng());
    });
}

function createSearchBox() {
    const searchInput = document.getElementById("search-input");
    const searchBox = new google.maps.places.SearchBox(searchInput);
    map.controls[google.maps.ControlPosition.TOP_RIGHT].push(searchInput);

    // bias the search results towards the current map bounds
    map.addListener("bounds_changed", () => {
	searchBox.setBounds(map.getBounds());
    })

    searchBox.addListener("places_changed", () => {
	const placeResult = searchBox.getPlaces();
	if (placeResult.length)	{
	    const resultLocation = placeResult[0].geometry.location;
	    map.setCenter(resultLocation)
	    marker.setPosition(resultLocation);
	    sessionStorage.setItem("Latitude", resultLocation.lat());
	    sessionStorage.setItem("Longitude", resultLocation.lng());
	}
    });
}

document.addEventListener("coords", () => {
    const lat = Number(sessionStorage.getItem("Latitude"));
    const lng = Number(sessionStorage.getItem("Longitude"));
    const latLng = { lat: lat, lng: lng };
    marker.setPosition(latLng);
    map.setCenter(latLng);
})
