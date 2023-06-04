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