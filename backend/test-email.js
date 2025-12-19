require("dotenv").config({ path: "./.env" });

const emailService = require("./emailService");

(async () => {
  console.log("🧪 Testing email...");

  const result = await emailService.sendAlertEmail({
    severity: "high",
    type: "Test",
    message: "This is a local test email",
    deviceId: "LOCAL",
    ts: Date.now(),
  });

  if (result) {
    console.log("✅ Test email sent");
  } else {
    console.log("❌ Test failed");
  }
})();