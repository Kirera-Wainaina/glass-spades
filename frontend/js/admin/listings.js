import { showLoadingPage, checkLogin, hideLoadingPage } from "../general.js";

if (navigator.userAgent != "glassspades-headless-chromium") {
    checkLogin();
}

document.addEventListener('DOMContentLoaded', getListings);

function getListings() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/admin/listings/getListings");
    xhr.send();

    xhr.onreadystatechange = function() {
	    if (this.readyState == 4 && this.response != "fail") {
	        const listings = JSON.parse(this.response);
	        sessionStorage.setItem("listings", this.response);
	        const unArchived = listings.filter(listing => listing.archived == false)
            
            displayListings(unArchived);
	        storeFeaturedListings(listings);
	        storeArchivedListings(listings);

	        displayFeaturedListings(listings);
	        displayArchivedListings(listings);
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

    button.addEventListener("click", () => {
        changeColor(button);
        document.getElementById("save-icon").style.display = "block";

        if (value == 'Featured') {
            addListingToState(button, 'featured');
        } else {
            addListingToState(button, 'archived');
        }
    });

    return button
}

function createHouse(listing) {
    const a = document.createElement("a");
    a.classList.add("house-details-card");
    a.href = `/admin/edit-listing?id=${listing.id}`;

    a.append(createHeading(listing.heading));
    a.append(createDevelopmentName(listing.development));
    a.append(createImage(listing.link));
    a.append(createPrice(listing.price));
    return a
}

function createHeading(heading) {
    const p = document.createElement("p");
    p.classList.add("listing-heading");
    p.textContent = heading;
    return p
}

function createDevelopmentName(name) {
    const p = document.createElement('p');
    p.classList.add('development-name');
    if (name) {
        p.textContent = `Development Name: ${name}`;
    } else {
        p.textContent = 'Development Name: N/A'
    }
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
    const formattedPrice = new Intl.NumberFormat(
        "sw-ke", 
        {
            style: "currency",
			currency: "Kes" 
        }
    )
	.format(price);
    p.textContent = `Price: ${formattedPrice}`;
    return p
}

function changeColor(element) {
    if (!element.classList.contains("clicked")) {
	    element.classList.add("clicked");
    } else {
	    element.classList.remove("clicked")
    }
}

function addListingToState(element, state) {
    const stateIds = JSON.parse(sessionStorage.getItem(state));
    const listingId = element.dataset.listingId;
    
    if (stateIds.includes(listingId)) {
	    const index = stateIds.findIndex(element => element == listingId);
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

function saveState(state, url) {
    return new Promise((resolve, reject) => {
        const stateIds = sessionStorage.getItem(state);
        const formdata = new FormData();
        formdata.set(state, stateIds);
    
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.send(formdata);
    
        xhr.onreadystatechange = function() {
            if (this.readyState == 4 && this.response != "fail") {
                // location.reload();
                resolve()
            }
        }            
    })
}

const showArchived = document.getElementById("show-archived");
showArchived.addEventListener("click", event => {
    const el = event.target;
    el.classList.toggle("clicked")

    const parentContainer = document.getElementById('listings');
    parentContainer.replaceChildren();

    const listings = filterArchived()

    displayListings(listings)
    displayArchivedListings(listings);
    displayFeaturedListings(listings);
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

const saveIcon = document.getElementById("save-icon");
saveIcon.addEventListener("click", async () => {
    showLoadingPage()
    await saveState("featured", "/api/admin/listings/saveFeatured");
    await saveState("archived", "/api/admin/listings/saveArchived");
    hideLoadingPage();
    location.reload();
})