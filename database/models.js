const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

dotenv.config()

const uri = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/glass-spades`;
mongoose.connect(uri,
		 {
		     useNewUrlParser: true,
		     useUnifiedTopology: true
		 });

const userSchema = new Schema({
    firstname: String,
    email: String,
    password: String
});

userSchema.methods.generatePassword = function() {
    return new Promise((resolve, reject) => {
	const saltRounds = 10;
	bcrypt.hash(this.password, saltRounds, (error, hash) => {
	    if (error) reject(error);
	    resolve(hash)
	});
    })
}

const User = mongoose.model("user", userSchema);

exports.User = User;
