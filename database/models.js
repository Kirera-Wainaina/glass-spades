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
		 })
    .then(() => console.log("database connected"))
    .catch(error => {
	console.log("There was an error connecting");
	console.log(error)
    })


mongoose.set("useFindAndModify", false);

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
    Mandate: String,
    Category: String,
    Development: String,
    Bedrooms: mongoose.Mixed,
    Bathrooms: Number,
    Size: Number,
    "Completion Month": String,
    "Completion Year": Number,
    "Unit Type": String,
    Price: Number,
    "Internal Features": [String],
    "External Features": [String],
    Location: {
	type: { type: String, enum: ["Point"], default: "Point" },
	coordinates: { type: [Number] }
    },
    Featured: { type: Boolean, default: false },
    Archived: { type: Boolean, default: false },
    "Location Name": String
});

const imageSchema = new Schema({
    listingId: mongoose.ObjectId,
    googleId: String,
    link: String,
    name: String,
    contentType: String,
    position: Number
});

const leadSchema = new Schema({
    name: String,
    email: String,
    phoneNumber: Number,
    listingId: mongoose.ObjectId,
    link: String,
    createdDate: Date
});

const articleImageSchema = new Schema({
    createTime: Number,
    link: String,
    name: String
})

const authorSchema = new Schema({
    authorName: String,
    bio: String,
    profileImageLink: String,
    profileImageName: String,
    url: String
})

const articleSchema = new Schema({
    authorId: mongoose.ObjectId,
    content: String,
    description: String,
    landscapeImage: String,
    landscapeImageText: String,
    portraitImage: String,
    portraitImageText: String,
    publishedDate: String,
    relatedArticle1: String,
    relatedArticle2: String,
    squareThumbnail: String,
    squareThumbnailText: String,
    title: String,
    updatedDate: String,
    urlTitle: String
})

const User = mongoose.model("user", userSchema);
const Listing = mongoose.model("listing", listingSchema);
const Image = mongoose.model("image", imageSchema);
const Lead = mongoose.model("lead", leadSchema);
const ArticleImage = mongoose.model("articleImage", articleImageSchema);
const Author = mongoose.model("author", authorSchema);
const Article = mongoose.model("article", articleSchema);

exports.User = User;
exports.Listing = Listing;
exports.Image = Image;
exports.Lead = Lead;
exports.ArticleImage = ArticleImage;
exports.Author = Author;
exports.Article = Article;