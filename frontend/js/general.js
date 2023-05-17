// <!-- Google Tag Manager -->
if (location.origin == "https://glassspades.com"
    && navigator.userAgent != "glassspades-headless-chromium") {
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WRW5KFK');
}
// <!-- End Google Tag Manager -->

// Prevent the contextmenu from showing when clicked on images
// Makes it hard to download images
document.addEventListener("contextmenu", event => {
    if (event.target.tagName == "IMG") event.preventDefault();
});

const mediaQueryResult = window.matchMedia("(max-width: 500px)");
mediaQueryResult.addEventListener("change", handleMenu);
handleMenu(mediaQueryResult);

function handleMenu(mediaQueryResult) {
    const menu = document.getElementById("menu");
    const menuButton = document.getElementById("menu-button");
    if (mediaQueryResult.matches) {
	menu.style.display = "none";
	menuButton.style.display = "block";
	menuButton.addEventListener("click", showPhoneMenu);
	document.addEventListener("click", hidePhoneMenu)
    } else {
	menu.style.display = "flex";
	menuButton.style.display = "none";
	menuButton.removeEventListener("click", showPhoneMenu);
	document.removeEventListener("click", hidePhoneMenu);
    }
}

function showPhoneMenu(event) {
    const menu = document.getElementById("menu");
    if (menu.style.display == "none") {
	menu.style.display = "flex";
	menu.classList.add("phone-menu");
    } else {
	menu.style.display  = "none";
    }
}

function hidePhoneMenu(event) {
    const menu = document.getElementById("menu");
    if (event.target.id != "menu-button" && menu.style.display == "flex") {
	menu.style.display = "none";
	console.log("called")
    }
}

const exists = new Event("exists");

document.addEventListener("exists", () => {
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
	if (navigator.userAgent != "glassspades-headless-chromium") {
	    // dont dispatch for ssr
	    document.dispatchEvent(exists);
	}
    } else {
	document.dispatchEvent(exists);
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
	container.append(createIcon(houseDetail.size,
				    "/frontend/images/size-icon.svg"))
    } else {
	container.append(createIcon(houseDetail.bedrooms,
				    "/frontend/images/bed-icon.svg"))
	container.append(createIcon(houseDetail.bathrooms,
				    "/frontend/images/bath-icon.svg"))
    }
    return container
}

function createIcon(value, icon) {
    const div = document.createElement("div");
    div.classList.add("card-details");

    const img = document.createElement("img");
    img.alt = `icon`;
    img.src = icon;
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

	// title += "with price "

	// if (minPrice && maxPrice == Number.MAX_SAFE_INTEGER) {
	//     title += `above ${minPrice} `;
	// } else if (!minPrice && maxPrice != Number.MAX_SAFE_INTEGER) {
	//     title += `below ${maxPrice} `;
	// } else if (minPrice && maxPrice != Number.MAX_SAFE_INTEGER) {
	//     title += `between ${minPrice} and ${maxPrice}`;
	// }
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