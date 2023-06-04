// <!-- Google Tag Manager -->
if (
  location.origin == "https://glassspades.com"
  && navigator.userAgent != "glassspades-headless-chromium"
) {
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