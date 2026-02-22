# 🔊 Voice Notification Setup for Mobile App

## Backend Changes ✅
- Added `priority: "high"` for urgent notifications
- Added `channelId: "temple-alerts"` for custom sound channel
- Added `_displayInForeground: true` to show even when app is open

## Mobile App Setup (React Native/Expo)

### 1. Install Dependencies
```bash
npm install expo-notifications expo-av
```

### 2. Add Custom Alert Sound

Download a loud alert sound (MP3/WAV) and place in:
```
assets/sounds/temple-alert.mp3
```

### 3. Configure Notifications in App.js

```javascript
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

// Create notification channel (Android)
async function setupNotificationChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('temple-alerts', {
      name: 'Temple Slot Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      sound: 'temple-alert.mp3', // Your custom sound file
      enableVibrate: true,
      enableLights: true,
      lightColor: '#FF0000',
    });
  }
}

// Play loud voice alert when notification received
Notifications.addNotificationReceivedListener(async (notification) => {
  const { sound } = await Audio.Sound.createAsync(
    require('./assets/sounds/temple-alert.mp3'),
    { shouldPlay: true, volume: 1.0 }
  );
  await sound.playAsync();
  
  // Optional: Text-to-Speech
  if (Platform.OS === 'android') {
    const Speech = require('expo-speech');
    Speech.speak('Temple slots are now open! Book immediately!', {
      language: 'en',
      pitch: 1.2,
      rate: 0.9,
      volume: 1.0,
    });
  }
});

// Call setup on app start
useEffect(() => {
  setupNotificationChannel();
}, []);
```

### 4. Alternative: Use System TTS (Text-to-Speech)

```bash
npm install expo-speech
```

```javascript
import * as Speech from 'expo-speech';

Notifications.addNotificationReceivedListener((notification) => {
  const message = notification.request.content.body;
  
  // Speak the notification
  Speech.speak(message, {
    language: 'en-US',
    pitch: 1.5,
    rate: 0.8,
    volume: 1.0,
    onDone: () => {
      // Repeat 3 times for urgency
      Speech.speak('Urgent! ' + message, { volume: 1.0 });
    }
  });
});
```

### 5. Recommended Alert Sounds

Free loud alert sounds:
- **Emergency Siren**: https://freesound.org/people/guitarguy1985/sounds/54047/
- **Air Horn**: https://freesound.org/people/InspectorJ/sounds/411639/
- **Temple Bell**: https://freesound.org/people/kyles/sounds/453391/

Download and add to `assets/sounds/` folder.

---

## Testing

1. Deploy backend changes:
```bash
git add .
git commit -m "Add high priority notifications"
git push
```

2. Test notification:
```bash
curl -X POST https://temple-slot-backend.onrender.com/register-token \
  -H "Content-Type: application/json" \
  -d '{"token":"YOUR_EXPO_PUSH_TOKEN"}'
```

3. Trigger manual check to test sound

---

## iOS Additional Setup

Add to `app.json`:
```json
{
  "expo": {
    "notification": {
      "sounds": ["./assets/sounds/temple-alert.mp3"]
    },
    "ios": {
      "infoPlist": {
        "UIBackgroundModes": ["audio"]
      }
    }
  }
}
```

---

## Quick Implementation (Minimal Code)

If you just want loud notifications without custom sounds:

```javascript
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});
```

That's it! The backend is already configured for high-priority notifications.
