const querystring = require("querystring");

const Busboy = require("busboy");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

const database = require("../database/models");

dotenv.config()


function createUser(request, response) {
    const busboy = new Busboy({ headers: request.headers });
    const saltRounds = 10;
    const userData = {}
        
    busboy.on("field", (fieldname, value) => {
	userData[fieldname] = value;
    })

    busboy.on("finish", () => {
	verifyAdminPassword(userData["admin-password"],
			     process.env.ENCRYPTED_ADMIN_PASSWORD)
	    .then(result => {
		if (result) {
		    confirmEmailExists(userData["email"])
			.then(emailExists => {
			    if (emailExists) {
				handleEmailExists(response);
			    } else {
				saveUser(userData, response)
			    }
			})
		} else {
		    handleWrongAdmin(response);
		}
	    })
	    .catch(error => console.error())

    })

    request.pipe(busboy);
}

function verifyAdminPassword(plain, encrypt) {
    return new Promise((resolve, reject) => {
	bcrypt.compare(plain, encrypt, (error, result) => {
	    if (error) reject(error);
	    resolve(result)
	})
    })
}

function confirmEmailExists(email) {
    return new Promise((resolve, reject) => {
	database.User.exists({ email })
	    .then(result => resolve(result))
	    .catch(error => reject(error))
    })
}

function handleWrongAdmin(response) {
    response
	.writeHead(401, {
	    "content-type": "text/plain"
	})
	.end("notAdmin")
    
}


function handleEmailExists(response) {
    response
	.writeHead(200, {
	    "content-type": "text/plain"
	})
	.end("emailExists")
}

function saveUser(doc, response) {
    delete doc["admin-password"];
    const user = new database.User(doc);
    user.generatePassword()
	.then(hash => {
	    user.password = hash;
	    const token = user.generateToken()
	    user.save()
	    response
		.writeHead(200, {
		    "content-type": "text/plain",
		    "set-cookie": `auth=${user.generateToken()}; path=/; HttpOnly;`
		})
		.end("success")
	})
}

function checkLogin(request, response) {
    if (request.headers.cookie) {
	const cookies = querystring.parse(request.headers.cookie, "; ");
	if (cookies.auth) {
	    response
		.writeHead(200, {
		    "content-type": "text/plain"
		})
		.end("/admin/home")
	}
    } else {
	response.writeHead(200, { "content-type": "text/plain" })
	    .end("")
    }
}

exports.createUser = createUser;
exports.checkLogin = checkLogin;
