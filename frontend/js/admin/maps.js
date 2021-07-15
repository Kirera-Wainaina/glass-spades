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
    const map = new google.maps.Map(mapEl, {
	center: nairobi,
	zoom: 15
    })

    createMarker(map, nairobi);
}

function createMarker(map, position) {
    const marker = new google.maps.Marker({
	map,
	draggable: true,
	position
    });

    marker.addListener("dragend", (event) => {
	houseInfo["Latitude"] = event.latLng.lat();
	houseInfo["Longitude"] = event.latLng.lng();
    });
}
