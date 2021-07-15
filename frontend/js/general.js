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
    } else {
	menu.style.display = "flex";
	menuButton.style.display = "none";
	menuButton.removeEventListener("click", showPhoneMenu);
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

export function displayHouseDetails(houseDetails) {
    if (!document.querySelector(".house-card")) {
	const listings = document.getElementById("listings");
	const fragment = new DocumentFragment();

	houseDetails.forEach(houseDetail => {
	    const houseCard = createHouseCard(houseDetail);
	    fragment.append(houseCard);
	})

	listings.appendChild(fragment);
    }
}

function createHouseCard(houseDetail) {
    const houseCard = document.createElement("a");
    houseCard.href = `/listing?id=${houseDetail.id}`;
    houseCard.classList.add("house-card");

    const overviewImg = document.createElement("img");
    overviewImg.src = houseDetail.imageSrc;
    overviewImg.alt = "Glass Spades Houses";

    houseCard.append(createHeading(houseDetail.heading));
    houseCard.append(overviewImg);
    houseCard.append(inputPrice(houseDetail.price));
    houseCard.append(createIcon(houseDetail.bedrooms,
				"/frontend/images/bed-icon.svg"))
    houseCard.append(createIcon(houseDetail.bathrooms,
				"/frontend/images/bath-icon.svg"))

    return houseCard
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
