# 🛕 Temple Slot Backend API

Base URL: `https://temple-slot-backend.onrender.com`

## Endpoints

### 1. Health Check
```
GET /health
```
**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-02-17T10:00:00.000Z"
}
```

---

### 2. Get All Sevas Status (NEW ✨)
```
GET /sevas
```
**Response:**
```json
{
  "temple": "Vadapalli Sri Venkateswara Swamy Temple",
  "sevas": [
    {
      "name": "Astotharam",
      "productId": 310,
      "status": "OPEN",
      "openDates": [
        { "date": "2026-03-15", "available": 5 },
        { "date": "2026-03-20", "available": 3 }
      ],
      "allDates": [
        { "date": "2026-02-22", "available": 0, "status": "FULL" },
        { "date": "2026-02-23", "available": 0, "status": "FULL" },
        { "date": "2026-03-15", "available": 5, "status": "OPEN" },
        { "date": "2026-03-20", "available": 3, "status": "OPEN" }
      ],
      "totalOpenDates": 2,
      "totalDates": 4,
      "checkedAt": "2025-02-17T10:00:00.000Z"
    },
    {
      "name": "Nithya Kalyanam",
      "productId": 311,
      "status": "FULL",
      "openDates": [],
      "allDates": [
        { "date": "2026-02-23", "available": 0, "status": "FULL" },
        { "date": "2026-02-24", "available": 0, "status": "FULL" },
        { "date": "2026-02-25", "available": 0, "status": "FULL" },
        { "date": "2026-02-26", "available": 0, "status": "FULL" },
        { "date": "2026-02-27", "available": 0, "status": "FULL" }
      ],
      "totalOpenDates": 0,
      "totalDates": 5,
      "checkedAt": "2025-02-17T10:00:00.000Z"
    }
  ],
  "checkedAt": "2025-02-17T10:00:00.000Z"
}
```

---

### 3. Register Push Token
```
POST /register-token
Content-Type: application/json

{
  "token": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```
**Response:**
```json
{
  "success": true
}
```

---

### 4. Get Notification History
```
GET /history
```
**Response:**
```json
[
  {
    "message": "🟢 Astotharam slots are OPEN! 2 dates available",
    "time": "2025-02-17T10:00:00.000Z"
  }
]
```

---

## Mobile App Integration

### Fetch All Sevas Status
```javascript
const API_URL = "https://temple-slot-backend.onrender.com";

async function getSevasStatus() {
  const response = await fetch(`${API_URL}/sevas`);
  const data = await response.json();
  
  data.sevas.forEach(seva => {
    console.log(`${seva.name}: ${seva.status}`);
    if (seva.status === "OPEN") {
      console.log(`Available dates: ${seva.totalOpenDates}`);
      seva.openDates.forEach(date => {
        console.log(`  - ${date.date}: ${date.available} slots`);
      });
    }
    // Show all dates (including full ones)
    console.log(`All dates (${seva.totalDates}):`);
    seva.allDates.forEach(date => {
      console.log(`  ${date.date}: ${date.status} (${date.available} slots)`);
    });
  });
}
```

### Display in React Native
```javascript
import { useEffect, useState } from 'react';

function SevasScreen() {
  const [sevas, setSevas] = useState([]);

  useEffect(() => {
    const fetchSevas = async () => {
      const res = await fetch('https://temple-slot-backend.onrender.com/sevas');
      const data = await res.json();
      setSevas(data.sevas);
    };

    fetchSevas();
    const interval = setInterval(fetchSevas, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <View>
      {sevas.map(seva => (
        <View key={seva.productId}>
          <Text>{seva.name}</Text>
          <Text>Status: {seva.status}</Text>
          {seva.status === "OPEN" && (
            <View>
              <Text>Available Dates: {seva.totalOpenDates}</Text>
              {seva.openDates.map(date => (
                <Text key={date.date}>
                  {date.date} - {date.available} slots
                </Text>
              ))}
            </View>
          )}
          <Text>All Dates ({seva.totalDates}):</Text>
          {seva.allDates.map(date => (
            <Text key={date.date} style={{ color: date.status === "OPEN" ? "green" : "red" }}>
              {date.date} - {date.status} ({date.available} slots)
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
```

---

## Features

✅ Tracks multiple sevas (Astotharam + Nithya Kalyanam)
✅ Shows all open dates with available quantities
✅ Checks every 1 minute
✅ Sends notifications when slots open
✅ High-priority push notifications
✅ History tracking
