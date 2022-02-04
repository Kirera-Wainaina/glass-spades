import { checkLogin } from "../general.js"

if (navigator.userAgent != "glassspades-headless-chromium") {
    checkLogin();
}
