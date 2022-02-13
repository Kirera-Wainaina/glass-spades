const { spawn, exec } = require("child_process");
const qs = require("querystring");
const path = require("path");
const fs = require("fs");

setInterval(checkStatus, 120000);
const webServerPID = startWebServer();

function checkStatus() {
    checkWebServer();
    checkRebootRequired();
}

function checkWebServer() {
    const pgrep = spawn("pgrep", ["-l", "node"]);
    pgrep.stdout.on("data", data => {
	const str = String(data)
	const parsed = qs.parse(str, "\n", " ");
	if (!Object.keys(parsed).includes(String(webServerPID))) {
	    // the web server is down, reboot
	    console.log("The webserver is down")
	    exec("reboot")
	}

    });
    pgrep.stderr.on("data", data => console.log(String(data)));
    pgrep.on("close", code => console.log("Pgrep just ran"));
}

function startWebServer() {
    const indexPath = path.join(__dirname, "index.js");
    const webServer = spawn("node", [indexPath]);
    webServer.stdout.on("data", data => console.log(String(data)))
    webServer.stderr.on("data", data => console.log(String(data)));
    webServer.on("close", code => console.log("Web server closed"));
    return webServer.pid
}

function checkRebootRequired() {
    // check for existence of file that requires reboot
    const rebootFilePath = path.join("/var/run", "reboot-required");
    fs.access(rebootFilePath, fs.constants.F_OK, error => {
	// file exists and reboot is required
	if (!error) exec("reboot");
    })
}
