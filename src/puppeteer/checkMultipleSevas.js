const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const { notify } = require("../notify/notify");

const filePath = path.join(__dirname, "../data/sevasState.json");

const SEVAS = [
  { name: "Astotharam", productId: 310 },
  { name: "Nithya Kalyanam", productId: 312 }
];

async function checkMultipleSevas() {
  console.log("🧿 Launching browser for multiple sevas...");

  const isProduction = !process.env.LOCALAPPDATA;
  
  const launchOptions = {
    headless: isProduction ? "new" : false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-dev-tools",
      ...(!isProduction ? ["--start-maximized"] : [])
    ],
    defaultViewport: isProduction ? { width: 1920, height: 1080 } : null,
  };

  if (!isProduction) {
    launchOptions.executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/138 Safari/537.36"
    );

    await page.goto("https://www.aptemples.org", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    console.log("✅ Session established");

    const results = [];

    for (const seva of SEVAS) {
      console.log(`\n🔍 Checking ${seva.name}...`);

      const apiResponse = await page.evaluate(async (productId) => {
        const res = await fetch(
          `https://api.aptemples.org/api/v1/seva-slot-daily-quota?fromDate=2026-02-10&toDate=2028-04-11&productId=${productId}&onlyOnlineEnabled=true`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "x-temple-code": "SVSTV",
            },
            credentials: "include",
          }
        );
        return res.json();
      }, seva.productId);

      const days = Array.isArray(apiResponse)
        ? apiResponse
        : Array.isArray(apiResponse?.data)
          ? apiResponse.data
          : [];

      const openDates = days
        .filter(day => day?.availableQuantity > 0)
        .map(day => ({
          date: day.date,
          available: day.availableQuantity
        }));

      const allDates = days.map(day => ({
        date: day.date,
        available: day.availableQuantity || 0,
        status: day.availableQuantity > 0 ? "OPEN" : "FULL"
      }));

      const status = openDates.length > 0 ? "OPEN" : "FULL";

      results.push({
        name: seva.name,
        productId: seva.productId,
        status,
        openDates,
        allDates,
        totalOpenDates: openDates.length,
        totalDates: allDates.length,
        checkedAt: new Date().toISOString()
      });

      console.log(`📊 ${seva.name}: ${status} (${openDates.length}/${allDates.length} dates available)`);
    }

    // Read previous state
    let previousData = {};
    if (fs.existsSync(filePath)) {
      previousData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    }

    const now = new Date();
    const data = {
      temple: "Vadapalli Sri Venkateswara Swamy Temple",
      sevas: results,
      checkedAt: now.toISOString(),
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    // Notify if any seva has open slots
    for (const result of results) {
      if (result.status === "OPEN") {
        const prevSeva = previousData.sevas?.find(s => s.productId === result.productId);
        const wasFullBefore = !prevSeva || prevSeva.status === "FULL";
        
        if (wasFullBefore) {
          await notify(`🟢 ${result.name} slots are OPEN! ${result.totalOpenDates} dates available`);
          console.log(`🔔 Notification sent for ${result.name}`);
        }
      }
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
}

module.exports = checkMultipleSevas;
