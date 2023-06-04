const overviewsPresent = new Event("overviews-in-dom");

document.addEventListener("overviews-in-dom", () => {
    const overviewImages = document.querySelectorAll(".overview");
    const options = {
	    root: null,
	    rootMargin: "0px",
	    threshold: .2
    };

    overviewImages.forEach(overview => {
 	    const observer = new IntersectionObserver(handleIntersect, options);
	    observer.observe(overview);
    })
})

function handleIntersect(entries) {
    entries.forEach(entry => {
	    if (entry.isIntersecting) {
	        entry.target.src = entry.target.dataset.imageSrc;
	    }
    })
}

export function displayHouseDetails(houseDetails, containerId="listings") {
    if (!document.querySelector(".house-card")) {
	    // before or without ssr
	    const listings = document.getElementById(containerId);
	    const fragment = new DocumentFragment();

	    houseDetails.forEach(houseDetail => {
	        const houseCard = createHouseCard(houseDetail);
	        fragment.append(houseCard);
	    })

	    if (listings) listings.appendChild(fragment);
	    // dispatch event after the images are in dom
        // for lazy loading. see line 58
	    if (navigator.userAgent != "glassspades-headless-chromium") {
	        // dont dispatch for ssr
	        document.dispatchEvent(overviewsPresent);
	    }
    } else {
	    document.dispatchEvent(overviewsPresent);
    }
}

function createHouseCard(houseDetail) {
    const houseCard = document.createElement("a");
    const listingUrl = houseDetail.heading.replaceAll(" ", "-")
	  .replaceAll(".", "-").toLowerCase();
    houseCard.href = `/listing/${listingUrl}?id=${houseDetail.id}`;
    houseCard.classList.add("house-card");

    const overviewImg = handleImage(houseDetail.imageSrc);

    houseCard.append(createHeading(houseDetail.heading));
    houseCard.append(overviewImg);
    houseCard.append(createOverviewDetails(houseDetail))
    return houseCard
}

function handleImage(imageSrc) {
    const overviewImg = document.createElement("img");
    overviewImg.dataset.imageSrc = imageSrc;
    overviewImg.src = "/frontend/images/GS-tiny-icon.png";
    overviewImg.alt = "Glass Spades Houses";
    overviewImg.width = "1623";
    overviewImg.height = "1080";
    overviewImg.classList.add("overview");
    return overviewImg;
}

function createHeading(heading) {
    const pEl = document.createElement("p");
    pEl.textContent = heading;
    pEl.classList.add("heading");
    return pEl
}

function inputPrice(price) {
    const divEl = document.createElement("div");
    divEl.classList.add("overview-price");
    const pEl = document.createElement("p");
    const formatPrice = new Intl
	  .NumberFormat("sw-ke", { style: "currency", currency: "Kes"})
	  .format(price);

    pEl.textContent = `${formatPrice}`;
    divEl.append(pEl);
    return divEl
}

function createOverviewDetails(houseDetail) {
    const container = document.createElement("div");
    container.id = "overview-details";
    container.append(inputPrice(houseDetail.price));
    if (houseDetail.category == "Land") {
	    container.append(createIcon(
            houseDetail.size,
	    	"/frontend/images/size-icon.svg"
        ))
    } else {
	    container.append(
            createIcon(houseDetail.bedrooms,
			"/frontend/images/bed-icon.svg"
        ))
	    container.append(
            createIcon(houseDetail.bathrooms,
		    "/frontend/images/bath-icon.svg"
        ))
    }
    return container
}

function createIcon(value, icon) {
    const div = document.createElement("div");
    div.classList.add("card-details");

    const img = document.createElement("img");
    img.alt = `icon`;
    img.src = icon;
    img.height = "24";
    img.width = "24";
    div.append(img);

    const p = document.createElement("p");
    p.textContent = value;
    div.append(p);

    return div
}

export function showLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "flex";

}

export function hideLoadingPage() {
    const loadingPage = document.getElementById("loading-page");
    loadingPage.style.display = "none";
}

/////////////////////////////////////////////////////////////////////////
///////////////////// Filter Functionality //////////////////////////////
if (location.pathname == "/sales" || location.pathname == "/rentals") {
    const locationElement = document.getElementById("locations");
    if (locationElement.childElementCount <= 1) {
	    (function (){
	        // Get Locations
	        const xhr = new XMLHttpRequest();
	        xhr.open("GET", "/api/admin/upload/sendModelData");
	        xhr.send()

	        xhr.onreadystatechange = function() {
	    	    if (this.readyState == 4) {
	    	        const model = JSON.parse(this.response);
	    	        const locationNames = model["Location Name"];
	    	        const fragment = new DocumentFragment();
	    	        locationNames.forEach(locationName => {
	    	    	    const option = document.createElement("option");
	    	    	    option.value = locationName;
	    	    	    option.textContent = locationName;
	    	    	    fragment.append(option)
	    	        })
	    	        locationElement.appendChild(fragment);
	    	    }
	        }
	    })()
    }
}

export function displayFilterBanner() {
    const filterContainer = document.getElementById("filter-container");
    const filterCard = document.getElementById("filter-card");
    filterContainer.style.display = "block";
    filterCard.style.display = "grid";    
}

export function closeElements(...elements) {
    elements.forEach(element => element.style.display = "none");
}

export function runFilter(mandate) {
    let maxPrice = document.getElementById("max-price").value;
    let minPrice = document.getElementById("min-price").value ;
    const bedrooms = document.getElementById("bedrooms").value;
    const location = document.getElementById("locations").value;
    const notices = document.querySelectorAll(".filter-notice");
    const closeIcon = document.getElementById("close-icon");
    const queries = [];

    // min is 0 if not input and max is MAX_SAFE_INTEGER if not input
    minPrice = minPrice != "" ? minPrice : 0;
    maxPrice = maxPrice != "" ? maxPrice : Number.MAX_SAFE_INTEGER;
    
    // clear prior notices before checking for any
    for (let i = 0; i < notices.length; i++) {
	    notices[i].style.display = "none";
    }

    if (verifyPrices(maxPrice, minPrice)) {
	    queries.push(`max-price=${maxPrice}`);
	    queries.push(`min-price=${minPrice}`);
    }
    if (verifyValue(bedrooms)) {
	    queries.push(`bedrooms=${bedrooms}`);
    }
    if (verifyValue(location)) {
	    queries.push(`location=${location}`);
    }

    closeIcon.click();
    handleRedirection(notices, queries);
}

function verifyPrices(maxPrice, minPrice) {
    if (Number(maxPrice) < Number(minPrice)) {
	    const notice = document.getElementById("wrong-entry");
	    notice.style.display = "block";
	    return false
    }
    return true
}

function verifyValue(value) {
    if (value == "") {
	    return false
    }
    return true
}

function handleRedirection(filterNotices, queries) {
    let query = "";
    queries.forEach((q, index, array) => {
	    if (index != array.length - 1) {
	        query += `${q}&`;
	    } else {
	        // last query doesn't have query separator '&'
	        query += `${q}`;
	    }
    });
    
    for (let i = 0; i < filterNotices.length; i++) {
	    if (filterNotices[i].style.display == "block") {
	        break
	    } else if (i == filterNotices.length - 1) {
	        location.href = location.origin + location.pathname + "?"+ query;
	    }
    }
}

export function generateTitle() {
    let title = "";
    if (location.search) {
	    const params = new URLSearchParams(location.search);
	    const maxPrice = params.get("max-price");
	    const minPrice = params.get("min-price");
	    if (params.has("bedrooms")) {
	        const bedrooms = params.get("bedrooms");
	        if (bedrooms == "Studio") {
	    	    title += `${bedrooms} `;
	        } else {
	    	    title += `${bedrooms} bedroom `;
	        }
	    }
	    title += "Houses ";
	    const mandate = location.pathname.replace("/", "");
	    if (mandate == "sales") {
	        title += `for sale `;
	    } else {
	        title += `for rent `;
	    }

	    if (params.has("location")) title += `in ${params.get("location")} `;
    }
    return title
}

export function checkLogin() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/login/checkLogin");
    xhr.send()

    xhr.onreadystatechange = function() {
	    if (xhr.readyState == 4 && xhr.response == "fail") {
	        location.href = "/login"
	    }
    }
}

export function urlifySentence(sentence) {
    return sentence
        .toLowerCase()
        .trim()
        .replace(/ /g, '-')
  	    .replace(/[^A-Za-z-]/g, '')
}

export function displaySnackbar(snackbarId) {
    const snackbar = document.getElementById(snackbarId);
    snackbar.addEventListener('animationend', () => {
        snackbar.classList.remove('slide');
        snackbar.classList.add('hide')
    })
    snackbar.classList.add('slide');
    snackbar.classList.remove('hide');
}

export function generateRandomName() {
    const number = Math.trunc(Math.random()*1e6);
    const date = Date.now();
    return `${number}-${date}`
}

export function toggleElementClass(element, className) {
    element.classList.toggle(className)
}