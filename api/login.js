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
	database.User.find({ "email": credentials["email"] })
	    .then(doc => {
		if (doc[0]) {
		    confirmPassword(credentials["password"],
				    doc[0].password,
				    response)
		} else {
		    console.log("email does not exist")
		}
	    })
	    .catch(error => console.error())
    });

    request.pipe(busboy)
}

function confirmPassword(loginPassword, dbPassword, response) {
    bcrypt.compare(loginPassword, dbPassword)
	.then(result => {
	    console.log(result)
	    // if (result) {
	    // 	confirmLogin()
	    // } else {
	    // 	disallowLogin()
	    // }
	})
}

exports.loginUser = loginUser;
