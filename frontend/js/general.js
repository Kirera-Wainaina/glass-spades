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
