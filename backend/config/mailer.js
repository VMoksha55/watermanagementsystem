const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE, // gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAlertEmail = async (subject, message) => {
  try {
    await transporter.sendMail({
      from: `"Water Management System" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL,
      subject: subject,
      text: message,
    });

    console.log("✅ Alert email sent successfully");
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
  }
};

module.exports = sendAlertEmail;