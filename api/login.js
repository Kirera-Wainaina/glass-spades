const querystring = require("querystring");

const busboy = require("busboy");
const bcrypt = require("bcrypt")

const database = require("../database/models");
const respond = require("../utils/respond");

function loginUser(request, response) {
    const bb = busboy({ headers: request.headers });
    const credentials = {};

    bb.on("field", (fieldname, value) => {
	credentials[fieldname] = value;
    })

    bb.on("finish", () => {
	database.User.find({ "email": credentials["email"] })
	    .then(doc => {
		if (doc[0]) {
		    confirmPassword(credentials["password"], doc[0], response)
		} else {
		    disallowLogin(response)
		}
	    })
	    .catch(error => console.error())
    });

    request.pipe(bb)
}

function confirmPassword(loginPassword, user, response) {
    bcrypt.compare(loginPassword, user.password)
	.then(result => {
	    if (result) {
		confirmLogin(user, response)
	    } else {
		disallowLogin(response)
	    }
	})
}

function confirmLogin(user, response) {
    response
	.writeHead(200, {
	    "content-type": "text/plain",
	    "set-cookie": `auth=${user.generateToken()}; path=/; HttpOnly;`
	})
	.end("success")
}

function disallowLogin(response) {
    response
	.writeHead(401, {
	    "content-type": "text/plain"
	})
	.end("error")
}
    
function checkLogin(request, response) {
    if (request.headers.cookie) {
	const cookies = querystring.parse(request.headers.cookie, "; ");
	if (cookies.auth) {
	    respond.handleTextResponse(response, "verified")
	} else {
	    respond.handleTextResponse(response, "fail")
	}
    } else {
	respond.handleTextResponse(response, "fail");
    }
}

exports.loginUser = loginUser;
exports.checkLogin = checkLogin;
