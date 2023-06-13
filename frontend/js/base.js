// Prevent the contextmenu from showing when clicked on images
// Makes it hard to download images
document.addEventListener("contextmenu", event => {
  if (event.target.tagName == "IMG") event.preventDefault();
});

document.addEventListener('DOMContentLoaded', () => {
  const mediaQueryResult = window.matchMedia("(max-width: 500px)");
  mediaQueryResult.addEventListener("change", handleMenu);
  handleMenu(mediaQueryResult);  
})

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
    }
}