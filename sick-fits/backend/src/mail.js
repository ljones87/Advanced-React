const nodemailer = require("nodemailer");

const transport = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "83585ca302a80b",
    pass: "e68c2bf0d6dfe1"
  }
});

const makeNiceEmail = (text) => `
  <div className="email" style="
    border: 1px solid black;
    padding: 20px;
    font-family: sans-serif;
    line-height: 2;
    font-size: 20px;
  ">
  <h2>Hello There!</h2>
  <p>${text}</p>
  <p>Yours Truly, Ima Hog</p>
  </div>
`

module.exports = {
    transport,
    makeNiceEmail
}