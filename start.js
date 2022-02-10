const { spawn } = require("child_process");


// setInterval(checkStatus, 120000);
checkStatus();

function checkStatus() {
    checkNodeServer();
}

function checkNodeServer() {
    const pgrep = spawn("pgrep", ["-l", "node"]);
    pgrep.stdout.on("data", data => console.log(String(data)));
    pgrep.stderr.on("data", data => console.log(String(data)));
    pgrep.on("close", code => console.log("Pgrep just ran"));
}
