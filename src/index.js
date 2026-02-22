require("dotenv").config();

const express = require("express");
const cron = require("node-cron");
const fs = require("fs");
const path = require("path");

const checkSlots = require("./puppeteer/checkSlotsPuppeteer");
const checkMultipleSevas = require("./puppeteer/checkMultipleSevas");
const { registerToken } = require("./notify/notify");

const app = express();
app.use(express.json());

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
const historyPath = path.join(__dirname, "./data/history.json");
const sevasStatePath = path.join(__dirname, "./data/sevasState.json");

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

// 🔹 Get All Sevas Status with Open Dates
app.get("/sevas", (req, res) => {
  try {
    if (!fs.existsSync(sevasStatePath)) {
      return res.json({ sevas: [] });
    }

    const data = JSON.parse(fs.readFileSync(sevasStatePath));
    res.json(data);
  } catch (err) {
    console.error("❌ Error reading sevas:", err.message);
    res.status(500).json({ error: "Failed to load sevas" });
  }
});

// 🔹 Test Product ID
app.get("/test-product/:productId", async (req, res) => {
  const { productId } = req.params;
  res.json({ message: `Testing product ID ${productId}. Check logs for results.` });
  
  const checkSlots = require("./puppeteer/checkSlotsPuppeteer");
  try {
    await checkSlots();
  } catch (err) {
    console.error("Test failed:", err.message);
  }
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
  checkMultipleSevas();

  // 🔁 Auto-check every 1 minute
  cron.schedule("* * * * *", async () => {
    console.log("⏳ Running scheduled slot check...");
    try {
      await checkMultipleSevas();
    } catch (err) {
      console.error("❌ Scheduled check failed:", err.message);
    }
  });
});
