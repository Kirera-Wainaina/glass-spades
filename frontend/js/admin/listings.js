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
		saveFeaturedListings(listings);
		displayFeaturedListings(listings)
	    }
	}
    }
}

function displayListings(listings) {
    const listingsEl = document.getElementById("listings");
    listings.forEach(listing => {
	listingsEl.append(createHouseSection(listing));
    });
}

function createHouseSection(listing) {
    const div = document.createElement("div");
    div.classList.add("listing-container");

    div.append(createButtonSection(listing.id))
    div.append(createHouse(listing));
    return div
}

function createButtonSection(listingId) {
    const div = document.createElement("div");
    div.classList.add("button-section");
    div.append(createButton("Featured", listingId));
    div.append(createButton("Archived", listingId))
    return div
}

function createButton(value, listingId) {
    const button = document.createElement("button");
    button.textContent = value;
    button.name = value;
    button.type = "button";
    button.setAttribute("data-listing-id", listingId);
    button.addEventListener("click", changeColor)
    button.addEventListener("click", addListingToFeatured);
    return button
}

function createHouse(listing) {
    const a = document.createElement("a");
    a.classList.add("house-card");
    a.href = `/admin/edit?id=${listing.id}`;

    a.append(createHeading(listing.heading));
    a.append(createImage(listing.link));
    a.append(createPrice(listing.price));
    return a
}

function createHeading(heading) {
    const p = document.createElement("p");
    p.classList.add("heading");
    p.textContent = heading;
    return p
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

function changeColor(event) {
    const el = event.target;
    if (!el.classList.contains("clicked")) {
	el.classList.add("clicked");
    } else {
	el.classList.remove("clicked")
    }
}

function addListingToFeatured(event) {
    const el = event.target;
    const featured = JSON.parse(sessionStorage.getItem("featured"));
    const listingId = el.dataset.listingId;
    
    if (featured.includes(listingId)) {
	const index = featured.findIndex(el => el == listingId);
	featured.splice(index, 1);
    } else {
	featured.push(listingId);
    }
    sessionStorage.setItem("featured", JSON.stringify(featured))
    console.log(featured)
}

function saveFeaturedListings(listings) {
    const featuredListings = listings.filter(listing => listing.featured == true);
    const featuredIds = featuredListings.map(listing => listing.id);
    
    sessionStorage.setItem("featured", JSON.stringify(featuredIds));
}

function displayFeaturedListings(listings) {
    const featuredListings = listings.filter(listing => listing.featured == true)
    const featuredButtons = document.querySelector("button[name='Featured']");
    featuredListings.forEach(listing => {
	featuredButtons.forEach(button => {
	    if (button.dataset.listingId == listing.id) {
		button.classList.add("clicked");
	    }
	});
    })
}
