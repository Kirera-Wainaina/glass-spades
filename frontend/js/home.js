getListings()

function getListings() {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "/api/home/getListings")
    xhr.send();

    xhr.onreadystatechange = function() {
	if (xhr.readyState == 4) {
	    console.log(this.response);
	    const houseDetails = JSON.parse(this.response);
	    displayHouseDetails(houseDetails);
	}
    }
}

function displayHouseDetails(houseDetails) {
    const listings = document.getElementById("listings");
    const fragment = new DocumentFragment();

    houseDetails.forEach(houseDetail => {
	const houseCard = createHouseCard(houseDetail);
	fragment.append(houseCard);
    })

    listings.appendChild(fragment);
}

function createHouseCard(houseDetail) {
    const houseCard = document.createElement("div");
    houseCard.classList.add("house-card");

    const overviewImg = document.createElement("img");
    overviewImg.src = houseDetail.imageSrc;
    overviewImg.alt = "Glass Spades Houses";
    houseCard.append(overviewImg);

    const housePrice = document.createElement("p");
    housePrice.textContent = houseDetail.price;
    houseCard.append(housePrice);

    return houseCard
}
