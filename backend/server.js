/**
 * ================================
 * SERVER CONFIGURATION
 * ================================
 */

require("dotenv").config(); // Loads env vars locally (Render ignores .env)

const express = require("express");
const cors = require("cors");

const emailService = require("./emailService");

const app = express();

/**
 * ================================
 * MIDDLEWARE
 * ================================
 */
app.use(cors()); // Allow frontend + ESP32
app.use(express.json()); // Parse JSON body

/**
 * ================================
 * INITIALIZE EMAIL SERVICE
 * ================================
 */
emailService.configure();

/**
 * ================================
 * HEALTH CHECK (RENDER NEEDS THIS)
 * ================================
 */
app.get("/", (req, res) => {
  res.status(200).send("✅ Water Management Backend is LIVE");
});

/**
 * ================================
 * TEST EMAIL ROUTE (MANUAL CHECK)
 * ================================
 */
app.get("/test-email", async (req, res) => {
  try {
    await emailService.sendAlertEmail({
      severity: "high",
      type: "Live Test",
      message: "Email sent from LIVE Render server",
      deviceId: "SERVER",
      ts: Date.now(),
    });

    res.status(200).json({
      success: true,
      message: "📧 Test email sent successfully",
    });
  } catch (error) {
    console.error("Email error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to send test email",
    });
  }
});

/**
 * ================================
 * ESP32 SENSOR ENDPOINT
 * ================================
 */
app.post("/api/sensor", async (req, res) => {
  try {
    const { waterLevel, deviceId } = req.body;

    console.log("📡 Sensor Data:", req.body);

    if (waterLevel === undefined) {
      return res.status(400).json({
        success: false,
        message: "waterLevel is required",
      });
    }

    // Trigger alert if water level is high
    if (waterLevel > 80) {
      await emailService.sendAlertEmail({
        severity: "high",
        type: "Water Level Alert",
        message: `Water level reached ${waterLevel}%`,
        deviceId: deviceId || "ESP32-01",
        ts: Date.now(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Sensor data received",
    });
  } catch (error) {
    console.error("Sensor error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
});

/**
 * ================================
 * SERVER START
 * ================================
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});