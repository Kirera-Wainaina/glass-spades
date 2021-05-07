const Busboy = require("busboy");

function loginUser(request, response) {
    const busboy = new Busboy({ headers: request.headers });

    busboy.on("field", (fieldname, value) => {
	console.log(`${fieldname}: ${value}`)
    })

    request.pipe(busboy)
}

exports.loginUser = loginUser;
