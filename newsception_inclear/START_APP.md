# 🚀 InClear - Complete Startup Guide

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (already configured)
- Internet connection for API calls

## Quick Start (2 Steps)

### Step 1: Start Backend
Open a terminal in the `backend` folder and run:

```bash
cd backend
npm install
npm run dev
```

**Wait for:** `🚀 Server running on port 5000` message

### Step 2: Start Frontend
Open a NEW terminal in the main project folder and run:

```bash
npm install
npm run dev
```

**Wait for:** `Ready - started server on 0.0.0.0:3000` message

### Step 3: Open Browser
Go to: **http://localhost:3000**

---

## ✅ What's Working Now

### Real-Time Features:
1. **Live News Fetching** - Using NewsAPI.org (API Key: configured)
2. **AI Sentiment Analysis** - Using OpenRouter/Gemini (API Key: configured)
3. **Dynamic Sources** - Real articles from BBC, CNN, Reuters, etc.
4. **Perspective Analysis** - AI-powered stance detection
5. **Bias Detection** - Loaded terms and coverage tilt analysis
6. **Claim Verification** - Factual vs opinion classification

### Test Queries:
Try searching for:
- "women world cup"
- "artificial intelligence regulation"
- "climate change"
- "cryptocurrency"
- Any current news topic!

---

## 🔍 How It Works

### When you search "women world cup":

1. **NewsAPI Fetch** (Backend)
   - Fetches 20-30 real articles from major news sources
   - Returns titles, descriptions, sources, URLs

2. **AI Analysis** (OpenRouter/Gemini)
   - Analyzes each article for:
     - **Perspective**: Support/Oppose/Neutral
     - **Sentiment**: Positive/Negative/Mixed
     - **Key Points**: Main arguments
     - **Claims**: Factual statements
     - **Bias**: Language analysis

3. **Display Results** (Frontend)
   - Two-column perspective view
   - Real sources with credibility scores
   - Interactive sentiment charts
   - Fact-check panel
   - Historical timeline

---

## 🔧 Troubleshooting

### Backend not starting?
```bash
cd backend
npm install --force
npm run dev
```

### Frontend errors?
```bash
npm install --force
npm run dev
```

### MongoDB connection issues?
- Check internet connection
- MongoDB Atlas should be accessible
- Credentials are already in .env file

### No results showing?
1. Check backend terminal for errors
2. Look for "Successfully fetched X articles" message
3. Check browser console (F12) for API errors
4. Make sure backend is running on port 5000

---

## 📝 Environment Variables

### Backend (.env) - Already Configured ✅
- MongoDB: Connected to Atlas
- NewsAPI: API key configured
- OpenRouter: AI key configured
- LiveKit: Debate system configured

### Frontend (.env.local) - Already Configured ✅
- Backend URL: http://localhost:5000/api
- LiveKit URL: wss://inclear-bugrya3r.livekit.cloud

---

## 🎯 Features to Test

### 1. Home Page
- Search bar with instant routing
- Beautiful landing design
- Feature showcases

### 2. Dashboard
- Dynamic news feed from backend
- Location-based trending (if permission granted)
- Infinite scroll loading
- Click any story → Compare page

### 3. Compare Page (Main Feature!)
- **Dual Perspective View**
  - Side A vs Side B
  - Real articles as sources
  - Credibility scores
  - Key points extracted by AI

- **Sentiment Analysis**
  - Overall sentiment breakdown
  - Entity-specific sentiments
  - Emotional tone analysis

- **Bias Visualization**
  - Coverage tilt indicator
  - Loaded terms highlighted
  - Political spectrum mapping

- **Fact Checking**
  - Claims extracted from articles
  - Verifiability scores
  - Type classification

- **Historical Context**
  - Timeline of related events
  - Key developments

### 4. Debate Room
- Live voice debates with AI moderation
- LiveKit integration
- Topic-based rooms

---

## 🎨 UI/UX Highlights

- **Newspaper-inspired design**
- **Dark mode support**
- **Smooth animations (Framer Motion)**
- **Mobile responsive**
- **Professional typography (Serif + Sans)**
- **Gold accent colors (#d4af37)**

---

## 📊 API Endpoints Being Used

### Backend (http://localhost:5000/api)

1. **GET /articles/feed/items**
   - Returns paginated news feed
   - Used by: Dashboard

2. **POST /analysis/compare**
   - Analyzes topic with AI
   - Returns dual perspectives
   - Used by: Compare page

3. **GET /news/trending**
   - Location-based trending topics
   - Used by: Dashboard trending bar

4. **GET /analysis/historical**
   - Historical context for topics
   - Used by: Compare page timeline

---

## 🐛 Known Issues & Fixes

### Issue: "Backend not available"
**Fix**: Make sure backend is running first (Step 1)

### Issue: TypeScript errors
**Fix**: Already fixed in latest code

### Issue: Slow loading
**Reason**: AI analysis takes 5-10 seconds (normal)
**Solution**: Loading states added

### Issue: Mock data showing
**Reason**: Backend not connected or API keys invalid
**Check**: Backend terminal for API call logs

---

## 💡 Tips for Best Results

1. **Start backend BEFORE frontend**
2. **Wait for successful startup messages**
3. **Use specific search terms** (e.g., "women world cup" not just "world cup")
4. **Check browser console** (F12) for any errors
5. **Be patient** - AI analysis takes a few seconds

---

## 🎉 Success Indicators

You'll know everything is working when:

✅ Backend shows: "✅ MongoDB connected"
✅ Backend shows: "✅ Redis connected" (or warning - that's OK)
✅ Backend shows: "🚀 Server running on port 5000"
✅ Frontend shows: "Ready - started server on 0.0.0.0:3000"
✅ Searching shows real article sources (BBC, CNN, etc.)
✅ AI sentiment analysis appears in Compare view
✅ Multiple perspectives displayed side-by-side

---

## 🔗 Important URLs

- **Frontend**: http://localhost:3000
- **Backend Health**: http://localhost:5000/health
- **API Base**: http://localhost:5000/api

---

## 📞 Support

If you see any errors:
1. Check backend terminal
2. Check frontend terminal  
3. Check browser console (F12)
4. Verify both servers are running
5. Try restarting both servers

**Everything is configured - just start both servers and test!** 🚀
