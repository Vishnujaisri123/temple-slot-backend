require("dotenv").config();

const express = require("express");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const checkSlots = require("./puppeteer/checkSlotsPuppeteer");
const { registerToken } = require("./notify/notify");

const app = express();
app.use(express.json());

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
const historyPath = path.join(__dirname, "./data/history.json");

// 🔹 Register Expo Push Token
app.post("/register-token", (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token is required" });
  }

  registerToken(token);
  console.log("📲 Token registered successfully");

  res.json({ success: true });
});

// 🔹 Get Alert History
app.get("/history", (req, res) => {
  try {
    if (!fs.existsSync(historyPath)) {
      return res.json([]);
    }

    const history = JSON.parse(fs.readFileSync(historyPath));
    res.json(history);
  } catch (err) {
    console.error("❌ Error reading history:", err.message);
    res.status(500).json({ error: "Failed to load history" });
  }
});

// 🔹 Start Server
app.listen(PORT, () => {
  console.log("🚀 Temple Slot Monitor Started");
  console.log(`🌐 Backend running on http://localhost:${PORT}`);

  // 🔥 Run once immediately
  checkSlots();

  // 🔁 Auto-check every 2 hours
  cron.schedule("0 */2 * * *", async () => {
    console.log("⏳ Running scheduled slot check...");
    try {
      await checkSlots();
    } catch (err) {
      console.error("❌ Scheduled check failed:", err.message);
    }
  });
});
