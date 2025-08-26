const nodemailer = require("nodemailer");
require("dotenv").config();

// CREATE A TRANSPORT FOR SMTP
const transporter = nodemailer.createTransport({
  host: process.env.NODE_MAILER_HOST,
  port: process.env.NODE_MAILER_PORT,
  secure: false,
  auth: {
    user: process.env.NODE_MAILER_USER,
    pass: process.env.NODE_MAILER_PASS,
  },
});

// Before you start sending, you can check that Nodemailer can connect to your SMTP server:
// await transporter.verify();
// console.log("Server is ready to take our messages");

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Your App" <${process.env.NODE_MAILER_EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email Sent: ", info.messageId, info.NODE_MAILER_EMAIL_USER);
    return info;
  } catch (error) {
    console.error("Email error:", err);
    throw err;
  }
};

module.exports = sendEmail;
