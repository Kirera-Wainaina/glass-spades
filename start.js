const { spawn, exec, fork } = require("child_process");
const qs = require("querystring");
const path = require("path");
const fs = require("fs");

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config()

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
	    emailCronLog();
	    exec("reboot")
	}

    });
    pgrep.stderr.on("data", data => console.log(String(data)));
    pgrep.on("close", code => console.log("Pgrep just ran"));
}

function startWebServer() {
    const indexPath = path.join(__dirname, "index.js");
    const webServer = fork(indexPath)
    webServer.on("close", code => console.log("Web server closed"));
    return webServer.pid
}

function checkRebootRequired() {
    // check for existence of file that requires reboot
    const rebootFilePath = path.join("/var/run", "reboot-required");
    fs.access(rebootFilePath, fs.constants.F_OK, error => {
	// file exists and reboot is required
	if (!error) {
	    emailCronLog();
	    exec("reboot");
	}
    })
}

function emailCronLog() {
    const message = {
	from: "glassspades@gmail.com",
	to: "richardwainainak@gmail.com",
	subject: "SERVER RESTART NOTICE",
	text: "The cron log file is attached. Please view for more information",
	attachments: [{
	    path: "/home/richard/glass-spades/cron.log",
	    filename: "cron.log",
	    cid: "cron.log"
	}]
    };

    const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
	    user: "glassspades@gmail.com",
	    pass: `${process.env.GMAIL_APP_PASSWORD}`
	}
    });

    transporter.sendMail(message, (error, info) => {
	if (error) console.log(error)

	if (info.accepted) {
	    console.log("Email was sent to and received by:")
	    console.log(info.accepted);
	}

	if (info.rejected) {
	    console.log("Email failed for the following recepient")
	    console.log(info.rejected)
	}
    })
}
