let marker, map;

window.addEventListener("load", () => {
    if (navigator.userAgent != "glassspades-headless-chromium") {
	appendMapsScript();
    }
})


function appendMapsScript() {
    const body = document.querySelector("body");
    const script = document.createElement("script");
    script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyDrVByoterVaoQyeLZ_ZmFvDBHcJJInQ84&callback=initMap&libraries=&v=weekly";
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

document.addEventListener("coords", () => {
    const lat = Number(sessionStorage.getItem("Latitude"));
    const lng = Number(sessionStorage.getItem("Longitude"));
    const latLng = { lat: lat, lng: lng };
    marker.setPosition(latLng);
    map.setCenter(latLng);
})
