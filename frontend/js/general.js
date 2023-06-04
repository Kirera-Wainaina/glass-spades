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
document.addEventListener("DOMContentLoaded", () => {
    if (location.pathname == "/sales" || location.pathname == "/rentals") {
        const locationElement = document.getElementById("locations");
        if (locationElement.childElementCount <= 1) {
            fetch("/api/admin/upload-listing/sendModelData")
                .then(response => response.json())
                .then(model => {
	    	        const locationNames = model["Location Name"];
	    	        const fragment = new DocumentFragment();
	    	        locationNames.forEach(locationName => {
	    	    	    const option = document.createElement("option");
	    	    	    option.value = locationName;
	    	    	    option.textContent = locationName;
	    	    	    fragment.append(option)
	    	        })
	    	        locationElement.appendChild(fragment);

                })
        }
    }
})

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