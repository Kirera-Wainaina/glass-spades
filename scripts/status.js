const { spawn, exec } = require("child_process");
const qs = require("querystring");
let nodeProcs;

const pgrep = spawn("pgrep", ["node"]);


pgrep.on("message", (message) => {
    console.log(`Message: ${message}`);
})

pgrep.on("exit", (code) => {
    console.log(nodeProcs);
    if (nodeProcs.length <= 1) {
	// restart server
	// send email and notify me of crash
	const shutdown = exec("shutdown -r now", (err, stdout, stderr) => {
	    if (err) console.log(err);
	})
    }
})

pgrep.stdout.on("data", data => {
    const procs = String(data);
    // parse the ids because they come as one string
    // querystring splits them into an object and the pids
    // are the keys. Get the object keys
    const pids = Object.keys(qs.parse(procs, "\n"));
    nodeProcs = pids;
})

pgrep.stderr.on("data", error => {
    console.log(`Error: ${error}`)
})
