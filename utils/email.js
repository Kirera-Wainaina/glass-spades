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
	    path: dir + "/frontend/images/GS-logo.png",
	    filename: "GS-logo.png",
	    cid: "GS-logo.png"
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
  <head>
    <style>
    .page {
        display: grid;
        grid-template-columns: repeat(12, 1fr);
    }
    
    #header-block {
        border-bottom: 1px solid lightgrey;
        grid-column: 1 / 13;
        height: 4em;
    
        display: grid;
        grid-template-columns: repeat(12, 1fr);
    }
    
    #header-anchor {
        grid-column: 1 / 7;
        height: inherit;
        margin-left: 1em;
    }
    
    #header-img {
        height: 90%;
    }

    #logo-p {
        font-size: 1.5em;
    }
    
    #lead-card {
        grid-column: 4 / 10;
        border: 1px ridge lightgrey;
        margin: 2em;
        padding: 1em;
    }
    
    .footer-anchors {
        display: block;
        text-align: center;
        margin-bottom: 1em;
        font-size: 0.7em;
    }
    
    @media(max-width: 500px) {
        .page {
    	    grid-template-columns: repeat(5, 1fr);
        }
    
        header {
    	    grid-column: 1 / 6;
    	    grid-template-columns: repeat(5, 1fr);
        }
    
        #lead-card {
    	    grid-column: 1 / 6;
        }
    }
    </style>
  </head>

  <body>
    <div class="page">
      <div id="header-block">
	<a id="header-anchor" href="https://glassspades.com/" >
            <img id="header-img" src='cid:GS-logo.png'/>
        </a>
      </div>

      <div id="lead-card">
	<p>Name: ${leadDetails["first-name"]}</p>
	<p>Email: ${leadDetails["email"]}</p>
	<p>Phone Number: ${leadDetails["phone-number"]}</p>
	<p>Listing Link: <a href=${leadDetails["link"]}>Listing of interest</a></p>
      </div>

      <footer id="footer-block">
	<a class="footer-anchors" href="/terms">Terms of service</a>
	<a class="footer-anchors" href="/privacy-policy">Privacy Policy</a>
	<a class="footer-anchors" href="/contacts">Contact Us</a>
	<p class="footer-anchors">&copy Glass Spades. All rights reserved.</p>
      </footer>
    </div>

  </body>
`;

    return htmlText
}


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
