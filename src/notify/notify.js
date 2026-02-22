// const axios = require("axios");

// let savedExpoPushToken = null;

// // 🔹 Function to register phone token
// function registerToken(token) {
//   savedExpoPushToken = token;
//   console.log("📲 Expo Push Token registered:", token);
// }

// // 🔹 Send notification to phone
// async function notify(message) {
//   console.log("🔔 NOTIFICATION:", message);

//   if (!savedExpoPushToken) {
//     console.log("⚠️ No Expo Push Token registered yet.");
//     return;
//   }

//   try {
//     await axios.post("https://exp.host/--/api/v2/push/send", {
//       to: savedExpoPushToken,
//       sound: "default",
//       title: "🛕 Temple Alert",
//       body: message,
//     });

//     console.log("✅ Push notification sent successfully!");
//   } catch (error) {
//     console.error("❌ Failed to send push:", error.message);
//   }
// }

// module.exports = {
//   notify,
//   registerToken,
// };
const fs = require("fs");
const path = require("path");
const axios = require("axios");

let savedExpoPushToken = null;
const historyPath = path.join(__dirname, "../data/history.json");

function registerToken(token) {
  savedExpoPushToken = token;
  console.log("📲 Expo Push Token registered:", token);
}

async function notify(message) {
  console.log("🔔 NOTIFICATION:", message);

  // 📝 Save to history
  let history = [];
  if (fs.existsSync(historyPath)) {
    history = JSON.parse(fs.readFileSync(historyPath));
  }

  history.unshift({
    message,
    time: new Date().toISOString(),
  });

  fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));

  if (!savedExpoPushToken) return;

  try {
    await axios.post("https://exp.host/--/api/v2/push/send", {
      to: savedExpoPushToken,
      sound: "default",
      title: "🛕 Temple Alert",
      body: message,
      priority: "high",
      channelId: "temple-alerts",
      _displayInForeground: true,
    });

    console.log("✅ Push sent!");
  } catch (err) {
    console.error("❌ Push failed:", err.message);
  }
}

module.exports = { notify, registerToken };
