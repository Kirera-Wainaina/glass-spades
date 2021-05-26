const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

userSchema.methods.generateToken = function() {
    return jwt.sign({ _id: this._id }, process.env.TOKEN_KEY)
}

const listingSchema = new Schema({
    Heading: String,
    Description: String,
    Category: String,
    Bedrooms: Number,
    Bathrooms: Number,
    "Internal Features": [String],
    "External Features": [String]
});

const imageSchema = new Schema({
    googleId: String,
    link: String,
    name: String,
    contentType: String
});

const User = mongoose.model("user", userSchema);
const Listing = mongoose.model("listing", listingSchema);
const Image = mongoose.model("image", imageSchema);

exports.User = User;
exports.Listing = Listing;
exports.Image = Image;
