const express = require("express");
const router = express.Router();
const { sendTestAlert } = require("../controllers/alertController");

router.get("/send-alert", sendTestAlert);

module.exports = router;