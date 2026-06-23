const nodemailer = require("nodemailer");
require("dotenv").config();

const isConfigured = process.env.EMAIL_USER && process.env.EMAIL_PASS;

let transporter;

if (isConfigured) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log("📧 Nodemailer Configured Successfully");
} else {
  console.log("⚠️ Nodemailer credentials missing. Emails will be logged to console in development mode.");
}

const sendEmail = async ({ to, subject, html }) => {
  if (isConfigured) {
    try {
      await transporter.sendMail({
        from: `"Emerging Technologies Learning Portal" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      });
      return true;
    } catch (error) {
      console.error("❌ Email sending failed:", error);
      return false;
    }
  } else {
    console.log("=========================================");
    console.log(`✉️ MOCK EMAIL SENT`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content HTML:\n${html}`);
    console.log("=========================================");
    return true;
  }
};

module.exports = {
  sendEmail
};
