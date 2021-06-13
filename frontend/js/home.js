getListings()

function getListings() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/home/getListings")
    xhr.send();

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    const houseDetails = JSON.parse(this.response);
	    displayHouseDetails(houseDetails);
	}
    }
}

function displayHouseDetails(houseDetails) {
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
    houseCard.append(overviewImg);

    houseCard.append(createBedrooms(houseDetail.bedrooms,
				    "/frontend/images/bed-icon.svg"))
    houseCard.append(createBedrooms(houseDetail.bathrooms,
				    "/frontend/images/bath-icon.svg"))

    return houseCard
}

function createBedrooms(value, icon) {
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
