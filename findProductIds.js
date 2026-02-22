const puppeteer = require("puppeteer");

async function findProductIds() {
  console.log("🔍 Finding all product IDs...");

  const isProduction = !process.env.LOCALAPPDATA;
  
  const launchOptions = {
    headless: isProduction ? "new" : false,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    defaultViewport: null,
  };

  if (!isProduction) {
    launchOptions.executablePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }

  const browser = await puppeteer.launch(launchOptions);

  try {
    const page = await browser.newPage();
    await page.goto("https://www.aptemples.org", { waitUntil: "networkidle2" });

    console.log("✅ Session established");
    console.log("\n🔍 Testing product IDs from 300 to 320...\n");

    for (let productId = 300; productId <= 320; productId++) {
      const result = await page.evaluate(async (id) => {
        try {
          const res = await fetch(
            `https://api.aptemples.org/api/v1/seva-slot-daily-quota?fromDate=2026-02-10&toDate=2026-04-11&productId=${id}&onlyOnlineEnabled=true`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                "x-temple-code": "SVSTV",
              },
              credentials: "include",
            }
          );
          const data = await res.json();
          const days = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
          return { id, found: days.length > 0, count: days.length };
        } catch (err) {
          return { id, found: false, error: err.message };
        }
      }, productId);

      if (result.found) {
        console.log(`✅ Product ID ${result.id}: FOUND (${result.count} dates)`);
      }
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
}

findProductIds();
