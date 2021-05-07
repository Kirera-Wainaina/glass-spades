const Busboy = require("busboy");
const bcrypt = require("bcrypt")

const database = require("../database/models");

function loginUser(request, response) {
    const busboy = new Busboy({ headers: request.headers });
    const credentials = {};

    busboy.on("field", (fieldname, value) => {
	credentials[fieldname] = value;
    })

    busboy.on("finish", () => {
	console.log(credentials["email"])
	database.User.exists({ "email": credentials["email"] })
	    .then(emailExists => {
		if (emailExists) {
		    confirmPassword(password, response)
		}
	    })
	    .catch(error => console.error())
    });

    request.pipe(busboy)
}

function confirmPassword(password, response) {
    
}

exports.loginUser = loginUser;
