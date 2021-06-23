const path = require("path")

const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

function emailLead(leadDetails) {
    console.log(leadDetails);
    const dir = path.dirname(__dirname);
    const message = {
	from: "glassspades@gmail.com",
	to: "richardwainainak@gmail.com",
	subject: "GLASS SPADES INQUIRY",
	html: createLeadHTML(leadDetails),
	text: createPlainText(leadDetails),
	attachments: [{
	    path: dir + "/frontend/images/GS-logo.webp",
	    filename: "GS-logo.webp",
	    cid: "GS-logo.webp"
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
	if (error) {
	    console.log(error);
	} else {
	    console.log(info.response)
	}
    })
}

function createLeadHTML(leadDetails) {
    const htmlText = `
  <body>
    <noscript>You need to enable Javascript to run this app</noscript>
    <div class="page">
      <header>
	<a href="/"><img src='cid:GS-logo.webp'/></a>
      </header>

      <div id="lead-card">
	<p>Name: ${leadDetails["first-name"]}</p>
	<p>Email: ${leadDetails["email"]}</p>
	<p>Phone Number: ${leadDetails["phone-number"]}</p>
	<p>Listing Link: <a href=${leadDetails["link"]}>Listing of interest</a></p>
      </div>

      <footer>
	<a href="/terms">Terms of service</a>
	<a href="/privacy-policy">Privacy Policy</a>
	<a href="/contacts">Contact Us</a>
	<p>&copy Glass Spades. All rights reserved.</p>
      </footer>
    </div>

  </body>
`;

    return htmlText
}

// const htmlText = `
// <!DOCTYPE html>

// <html lang="en">
//   <head>
//     <meta charset="utf-8">
//     <meta name="author" content="Kirera-Wainaina">
//     <meta name="description"
// 	  content="Finding a home should be an enjoyable journey and
// 	  the crowning moment is when you find a home that you and
// 	  your family love. We are a property agency that will help
// 	  you find your next home a lot quicker. We deal with other
// 	  property types as well and whatever your need, we will help
// 	  you find it. ">
//     <meta name="viewport" content="width=device-width, initial-scale=1">
//     <link rel="shortcut icon" href="/frontend/images/GS-tiny-icon.png">    
//     <link rel="apple-touch-icon" href="/frontend/images/GS-tiny-icon.png">
//     <link rel="stylesheet" href="/frontend/css/email-template.css">
//     <script type="module" async="async" src="/frontend/js/home.js"></script>
//     <title>Glass Spades | Find the property that fits your needs</title>
//   </head>

//   <body>
//     <noscript>You need to enable Javascript to run this app</noscript>
//     <div class="page">
//       <header>
// 	<a href="/"><img src="/frontend/images/GS-logo.webp"/></a>
//       </header>

//       <div id="lead-card">
// 	<p>Name: ${leadDetails["first-name"]}</p>
// 	<p>Email: ${leadDetails["email"]}</p>
// 	<p>Phone Number: ${leadDetails["phone-number"]}</p>
// 	<p>Listing Link: <a href=${leadDetails["link"]}>Listing of interest</a></p>
//       </div>

//       <footer>
// 	<a href="/terms">Terms of service</a>
// 	<a href="/privacy-policy">Privacy Policy</a>
// 	<a href="/contacts">Contact Us</a>
// 	<p>&copy Glass Spades. All rights reserved.</p>
//       </footer>
//     </div>

//   </body>
  
// </html>
// `;

function createPlainText(leadDetails) {
    const plain = `
Name: ${leadDetails["first-name"]}\n
Phone Number: ${leadDetails["phone-number"]}\n
Email: ${leadDetails["email"]}\n
Listing URL: ${leadDetails["link"]}
`;
    return plain
}

exports.emailLead = emailLead;
