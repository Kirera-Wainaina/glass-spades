import { showLoadingPage } from "../general.js";

getListings();
function getListings() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/admin/listings/getListings");
    xhr.send();

    xhr.onreadystatechange = function() {
	if (this.readyState == 4 && this.response != "fail") {
	    const listings = JSON.parse(this.response);
	    sessionStorage.setItem("listings", this.response);
	    const unArchived = listings.filter(listing => listing.archived == false)
	    if (!document.querySelector(".listing-container")) {
		// dependent on whether it is ssr or not
		// displayListings(listings);
		displayListings(unArchived)
	    }
	    // whether ssr or not, the below functions have to run
	    storeFeaturedListings(listings);
	    storeArchivedListings(listings);

	    displayFeaturedListings(listings);
	    displayArchivedListings(listings);

	    handleStateButtons()
	}
    }
}

function displayListings(listings) {
    const listingsEl = document.getElementById("listings");
    listings.forEach(listing => {
	listingsEl.appendChild(createHouseSection(listing));
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

function handleStateButtons() {
    const stateButtons = document.querySelectorAll(".button-section button");
    stateButtons.forEach(stateButton => {
	stateButton.addEventListener("click", changeColor)
	if (stateButton.name == "Featured") {
	    stateButton.addEventListener(
		"click",event => addListingToState(event, "featured"));
	} else {
	    stateButton.addEventListener(
		"click", event => addListingToState(event, "archived"))
	}
    })
}

function changeColor(event) {
    const el = event.target;
    if (!el.classList.contains("clicked")) {
	el.classList.add("clicked");
    } else {
	el.classList.remove("clicked")
    }
}

function addListingToState(event, state) {
    const el = event.target;
    const stateIds = JSON.parse(sessionStorage.getItem(state));
    const listingId = el.dataset.listingId;
    
    if (stateIds.includes(listingId)) {
	const index = stateIds.findIndex(el => el == listingId);
	stateIds.splice(index, 1);
    } else {
	stateIds.push(listingId);
    }
    sessionStorage.setItem(state, JSON.stringify(stateIds))
}

function storeFeaturedListings(listings) {
    const featuredListings = listings.filter(listing => listing.featured == true);
    const featuredIds = featuredListings.map(listing => listing.id);

    sessionStorage.setItem("featured", JSON.stringify(featuredIds));
}

function storeArchivedListings(listings) {
    const archivedListings = listings.filter(listing => listing.archived == true);
    const archivedIds = archivedListings.map(listing => listing.id);

    sessionStorage.setItem("archived", JSON.stringify(archivedIds));
}

function displayFeaturedListings(listings) {
    const featuredListings = listings.filter(listing => listing.featured == true)
    const featuredButtons = document.querySelectorAll("button[name='Featured']");
    featuredListings.forEach(listing => {
	featuredButtons.forEach(button => {
	    if (button.dataset.listingId == listing.id) {
		button.classList.add("clicked");
	    }
	});
    })
}

function displayArchivedListings(listings) {
    const archivedListings = listings.filter(listing => listing.archived == true)
    const archivedButtons = document.querySelectorAll("button[name='Archived']");
    archivedListings.forEach(listing => {
	archivedButtons.forEach(button => {
	    if (button.dataset.listingId == listing.id) {
		button.classList.add("clicked");
	    }
	});
    })
}

const saveFeatured = document.getElementById("save-featured");
saveFeatured.addEventListener("click",() => saveState(
    "featured", "/api/admin/listings/saveFeatured"))

const saveArchived = document.getElementById("save-archived");
saveArchived.addEventListener("click",() => saveState(
    "archived", "/api/admin/listings/saveArchived"))

function saveState(state, url) {
    showLoadingPage();
    const stateIds = sessionStorage.getItem(state);
    const formdata = new FormData();
    formdata.set(state, stateIds);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.send(formdata);

    xhr.onreadystatechange = function() {
	if (this.readyState == 4 && this.response != "fail") {
	    location.reload();
	}
    }
}

const showArchived = document.getElementById("show-archived");
showArchived.addEventListener("click", event => {
    const el = event.target;
    el.classList.toggle("clicked")
    const containers = document.querySelectorAll(".listing-container");
    for (let i = 0; i < containers.length; i++) {
	containers[i].parentNode.removeChild(containers[i]);
    }
    displayListings(filterArchived())
    displayArchivedListings(filterArchived());
    displayFeaturedListings(filterArchived());
});

function filterArchived() {
    const listings = JSON.parse(sessionStorage.getItem("listings"));
    let filtered;
    if (showArchived.classList.contains("clicked")) {
	filtered = listings.filter(listing => listing.archived);
    } else {
	filtered = listings.filter(listing => !listing.archived);
    }

    return filtered
}
