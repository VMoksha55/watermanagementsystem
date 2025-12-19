// =======================
// EMAIL SERVICE MODULE
// =======================

require("dotenv").config({ path: "./.env" });

const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.configure();
  }

  configure() {
    const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASS } = process.env;

    if (!EMAIL_USER || !EMAIL_PASS) {
      console.error("❌ Email service not configured - missing credentials");
      return false;
    }

    this.transporter = nodemailer.createTransport({
      service: EMAIL_SERVICE || "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    this.isConfigured = true;
    console.log("✅ Email service configured successfully");
    return true;
  }

  async sendAlertEmail(alert) {
    if (!this.isConfigured) return false;

    await this.transporter.sendMail({
      from: `"Water Management System" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL,
      subject: `🚨 ${alert.severity.toUpperCase()} Alert`,
      html: `
        <h2>🚨 Water Management Alert</h2>
        <p><b>Device:</b> ${alert.deviceId}</p>
        <p><b>Type:</b> ${alert.type}</p>
        <p><b>Message:</b> ${alert.message}</p>
        <p><b>Time:</b> ${new Date(alert.ts).toLocaleString()}</p>
      `,
    });

    console.log("📧 Alert email sent");
    return true;
  }
}

module.exports = new EmailService();