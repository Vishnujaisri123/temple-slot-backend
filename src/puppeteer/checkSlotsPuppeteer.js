const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { notify } = require("../notify/notify");

const filePath = path.join(__dirname, "../data/slotState.json");

async function checkSlotsWithPuppeteer() {
  console.log("🧿 Launching real browser session...");

const browser = await puppeteer.launch({
  executablePath: process.env.NODE_ENV === "production" 
    ? undefined 
    : "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  headless: process.env.NODE_ENV === "production" ? "new" : false,
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--disable-dev-tools",
    ...(process.env.NODE_ENV === "production" ? [] : ["--start-maximized"])
  ],
  defaultViewport: process.env.NODE_ENV === "production" ? { width: 1920, height: 1080 } : null,
});


  try {
    const page = await browser.newPage();

    // REAL USER BEHAVIOR
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36",
    );

    // 1️⃣ OPEN WEBSITE → SESSION IS CREATED
    await page.goto("https://www.aptemples.org", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("✅ Session established");

    // 2️⃣ CALL REAL API INSIDE BROWSER CONTEXT
    const apiResponse = await page.evaluate(async () => {
      const res = await fetch(
        "https://api.aptemples.org/api/v1/seva-slot-daily-quota" +
          "?fromDate=2026-02-10" +
          "&toDate=2028-04-11" +
          "&productId=310" +
          "&onlyOnlineEnabled=true",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "x-temple-code": "SVSTV",
          },
          credentials: "include", // 🔑 session cookies
        },
      );

      return res.json();
    });

    // 3️⃣ NORMALIZE RESPONSE (THIS FIXES YOUR ERROR)
    const days = Array.isArray(apiResponse)
      ? apiResponse
      : Array.isArray(apiResponse?.data)
        ? apiResponse.data
        : [];

    if (!Array.isArray(days)) {
      throw new Error("Unexpected API response structure");
    }

    // 4️⃣ CALCULATE SLOT STATUS
    let status = "FULL";

    for (const day of days) {
      if (day?.availableQuantity > 0) {
        status = "OPEN";
        break;
      }
    }

    // Read previous state
    let previousData = {};
    if (fs.existsSync(filePath)) {
      previousData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    const now = new Date();
    const lastNotified = previousData.lastNotified ? new Date(previousData.lastNotified) : null;
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    const shouldNotify = status === "OPEN" && (!lastNotified || now - lastNotified >= twoHoursInMs);

    const data = {
      temple: "Vadapalli Sri Venkateswara Swamy Temple",
      seva: "Astotharam",
      productId: 310,
      status,
      checkedAt: now.toISOString(),
      lastNotified: shouldNotify ? now.toISOString() : previousData.lastNotified,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log("📊 SLOT STATUS:", status);

    // 5️⃣ NOTIFICATION TRIGGER (every 2 hours)
    if (shouldNotify) {
      await notify("🟢 Astotharam tickets are OPEN!");
      console.log("🔔 Notification sent");
    } else if (status === "OPEN" && lastNotified) {
      const minutesLeft = Math.ceil((twoHoursInMs - (now - lastNotified)) / 60000);
      console.log(`⏳ Next notification in ${minutesLeft} minutes`);
    }
  } catch (err) {
    console.error("❌ Puppeteer error:", err.message);
  } finally {
    await browser.close();
  }
}

module.exports = checkSlotsWithPuppeteer;
