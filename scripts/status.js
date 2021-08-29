const { spawn, exec } = require("child_process");
const qs = require("querystring");
const os = require("os");
let nodeProcs;

// Handle crashed node process
const pgrep = spawn("pgrep", ["node"]);

pgrep.on("message", (message) => {
    console.log(`Message: ${message}`);
})

pgrep.on("exit", (code) => {
    // console.log(nodeProcs);
    if (nodeProcs.length <= 1) {
	// restart server
	console.log(`Reboot due to crash at ${new Date()}`)
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

// Check Memory usage
function calcUsedMemory() {
    const free = os.freemem();
    const total = os.totalmem();
    return free / total * 100;
}

// reboot if memory is less than 20%
if (calcUsedMemory() < 20) {
    console.log(`Reboot due to memory at ${new Date()}`)
    exec("reboot", (err, stdout, stderr) => {
	if (err) console.log(err);
	if (stdout) console.log(stdout);
	if (stderr) console.log(stderr);
    })
}