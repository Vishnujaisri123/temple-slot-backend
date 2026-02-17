# 🚀 Deployment Guide - Temple Slot Backend

## Option 1: Render.com (Recommended - Free Tier)

### Steps:
1. **Create Account**: Go to https://render.com and sign up
2. **New Web Service**: Click "New +" → "Web Service"
3. **Connect Repository**: 
   - Connect your GitHub/GitLab account
   - Or use "Public Git repository" and paste your repo URL
4. **Configure**:
   - Name: `temple-slot-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `node src/index.js`
   - Instance Type: `Free`
5. **Environment Variables**: Add these in Render dashboard:
   ```
   NODE_ENV=production
   TEMPLE_PRODUCT_ID=310
   FROM_DATE=2026-02-10
   TO_DATE=2026-04-11
   ```
6. **Deploy**: Click "Create Web Service"

Your service will be live at: `https://temple-slot-backend.onrender.com`

---

## Option 2: Railway.app (Free $5 credit/month)

### Steps:
1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (same as above)
6. Deploy automatically

---

## Option 3: Fly.io (Free tier available)

### Steps:
1. Install Fly CLI: `npm install -g flyctl`
2. Login: `flyctl auth login`
3. Launch app: `flyctl launch`
4. Set secrets:
   ```bash
   flyctl secrets set NODE_ENV=production
   flyctl secrets set TEMPLE_PRODUCT_ID=310
   ```
5. Deploy: `flyctl deploy`

---

## 📱 Connect Your Mobile App

Once deployed, update your mobile app to use the online URL:

```javascript
const API_URL = "https://your-app-name.onrender.com";

// Register token
fetch(`${API_URL}/register-token`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token: expoPushToken })
});

// Get history
fetch(`${API_URL}/history`);
```

---

## ⚠️ Important Notes

1. **Free Tier Limitations**:
   - Render: Service sleeps after 15 min inactivity (wakes on request)
   - Railway: $5 credit/month (~500 hours)
   - Fly.io: 3 shared-cpu VMs free

2. **Keep Service Awake** (Optional):
   - Use cron-job.org to ping your service every 10 minutes
   - Add endpoint: `GET https://your-app.onrender.com/health`

3. **Puppeteer in Cloud**:
   - Runs in headless mode automatically
   - Uses Chromium instead of Chrome
   - All configured in the code already ✅

---

## 🔧 Troubleshooting

If deployment fails:
1. Check logs in your hosting dashboard
2. Ensure all dependencies are in package.json
3. Verify environment variables are set
4. Make sure PORT is not hardcoded (use process.env.PORT)

---

## 📊 Monitor Your Service

- **Render**: Dashboard → Logs
- **Railway**: Project → Deployments → Logs
- **Fly.io**: `flyctl logs`
