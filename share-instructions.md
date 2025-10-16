# 🌐 Sharing Your Toilet App

## Method 1: Local Network (Same WiFi)

### Your friends can access at:
```
http://192.168.2.202:5001
```

### On iPhone:
1. Open Safari
2. Go to the URL above
3. Tap Share → Add to Home Screen
4. Use like a native app!

### Requirements:
- ✅ Everyone on same WiFi
- ✅ Your Mac must be on
- ✅ App must be running

---

## Method 2: Ngrok (Quick Internet Access)

### Install Ngrok:
```bash
brew install ngrok
```

### Run Ngrok:
```bash
ngrok http 5001
```

### Share the URL:
Ngrok will give you a URL like: `https://abc123.ngrok.io`
Share this with anyone - works from anywhere!

**Note:** Free tier URL changes each time you restart ngrok.

---

## Method 3: Deploy to Render.com (Permanent)

### Step 1: Create GitHub Repo
1. Go to github.com
2. Create new repository: "mae-toilet-app"
3. Upload your code

### Step 2: Deploy to Render
1. Go to render.com
2. Sign up (free)
3. Click "New Web Service"
4. Connect your GitHub repo
5. Settings:
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn app:app`
6. Click "Create Web Service"

### Step 3: Get Your URL
You'll get a permanent URL like:
```
https://mae-toilet-app.onrender.com
```

Share this with everyone!

---

## Method 4: Deploy to Railway.app

Similar to Render:
1. Go to railway.app
2. Connect GitHub
3. Deploy
4. Get permanent URL

---

## Recommended Approach

**For Office Use:**
- Use Method 1 (Local Network) - simplest!

**For Remote Teams:**
- Use Method 3 (Render) - free and permanent!

**For Quick Testing:**
- Use Method 2 (Ngrok) - instant internet access!
