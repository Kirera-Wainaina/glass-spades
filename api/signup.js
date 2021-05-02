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
		    checkEmailExists(userData["email"], response)
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

function checkEmailExists(email, response) {
    database.User.exists({ email })
	.then(result => console.log(result))
	.catch(error => console.log(error))
}


exports.createUser = createUser;
