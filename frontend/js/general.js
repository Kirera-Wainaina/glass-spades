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

export function displayHouseDetails(houseDetails) {
    if (!document.querySelector(".house-card")) {
	// before or without ssr
	const listings = document.getElementById("listings");
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
    houseCard.href = `/listing?id=${houseDetail.id}`;
    houseCard.classList.add("house-card");

    console.log(houseDetail)
    const overviewImg = handleImage(houseDetail.imageSrc);

    houseCard.append(createHeading(houseDetail.heading));
    houseCard.append(overviewImg);
    houseCard.append(inputPrice(houseDetail.price));
    if (houseDetail.category == "Land") {
	houseCard.append(createIcon(houseDetail.size,
				    "/frontend/images/size-icon.svg"))
    } else {
	houseCard.append(createIcon(houseDetail.bedrooms,
				    "/frontend/images/bed-icon.svg"))
	houseCard.append(createIcon(houseDetail.bathrooms,
				    "/frontend/images/bath-icon.svg"))
    }

    return houseCard
}

function handleImage(imageSrc) {
    const overviewImg = document.createElement("img");
    overviewImg.dataset.imageSrc = imageSrc;
    overviewImg.src = "/frontend/images/GS-icon.webp";
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
    const pEl = document.createElement("p");
    const formatPrice = new Intl
	  .NumberFormat("sw-ke", { style: "currency", currency: "Kes"})
	  .format(price);

    pEl.textContent = `${formatPrice}`;
    divEl.append(pEl);
    return divEl
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
