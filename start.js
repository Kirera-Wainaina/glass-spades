const { spawn } = require("child_process");
const qs = require("querystring");
const path = require("path");

// setInterval(checkStatus, 120000);
const webServerPID = startWebServer();
checkStatus();

function checkStatus() {
    checkWebServer();
}

function checkWebServer() {
    const pgrep = spawn("pgrep", ["-l", "node"]);
    pgrep.stdout.on("data", data => {
	const str = String(data)
	const parsed = qs.parse(str, "\n", " ");
	console.log(`Web server PID: ${webServerPID}`)
	if (!Object.keys(parsed).includes(String(webServerPID))) {
	    // the web server is down, reboot
	    console.log("The webserver is down")
	}
	console.log(parsed);
    });
    pgrep.stderr.on("data", data => console.log(String(data)));
    pgrep.on("close", code => console.log("Pgrep just ran"));
}

function startWebServer() {
    const indexPath = path.join(__dirname, "index2.js");
    const webServer = spawn("node", [indexPath]);
    console.log(webServer.pid);
    webServer.stdout.on("data", data => console.log(String(data)))
    webServer.stderr.on("data", data => console.log(String(data)));
    webServer.on("close", code => console.log("Web server closed"));
    return webServer.pid
}
