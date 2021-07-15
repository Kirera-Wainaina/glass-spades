getListings();

function getListings() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/admin/listings/getListings");
    xhr.send();

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    if (this.response != "fail") {
		const listings = JSON.parse(this.response);
		console.log(listings);
		displayListings(listings);
	    }
	}
    }
}

function displayListings(listings) {
    const listingsEl = document.getElementById("listings");
    listings.forEach(listing => {
	listingsEl.append(createHouseContainer(listing));
    });
}

function createHouseContainer(listing) {
    const a = document.createElement("a");
    a.classList.add("house-card");
    a.href = `/admin/edit?id=${listing.id}`;

    a.append(createHeading(listing.heading));
    a.append(createImage(listing.link));
    a.append(createPrice(listing.price));
    return a
}

function createHeading(heading) {
    const h3 = document.createElement("h3");
    h3.textContent = heading;
    return h3
}

function createImage(link) {
    const img = document.createElement("img");
    img.src = link;
    img.alt = "Overview";
    return img
}

function createPrice(price) {
    const p = document.createElement("p");
    const formattedPrice = new Intl.NumberFormat("sw-ke", { style: "currency",
							    currency: "Kes" })
	.format(price);
    p.textContent = `Price: ${formattedPrice}`;
    return p
}
