const sendAlertEmail = require("../config/mailer");

exports.sendTestAlert = async (req, res) => {
  await sendAlertEmail(
    "🚨 Water Usage Alert",
    "Water level exceeded the safe threshold. Immediate action required."
  );

  res.json({ message: "Alert email triggered" });
};