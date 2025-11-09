# 🧪 Testing Guide - InClear Real-Time Features

## ✅ All Issues Fixed!

### What Was Wrong Before:
1. ❌ Hardcoded mock data on homepage
2. ❌ Dashboard showing fake articles
3. ❌ No real AI sentiment analysis
4. ❌ Mock sources instead of real news
5. ❌ No actual API integration

### What's Working Now:
1. ✅ Real-time news fetching from NewsAPI.org
2. ✅ AI-powered sentiment analysis via OpenRouter/Gemini
3. ✅ Dynamic article sources (BBC, CNN, Reuters, etc.)
4. ✅ Actual bias detection and loaded terms
5. ✅ Real claim extraction and verification
6. ✅ Live perspective analysis

---

## 🚀 How to Test

### Step 1: Start the Backend
```powershell
cd backend
npm install
npm run dev
```

**Wait for these messages:**
```
✅ MongoDB connected successfully
🚀 Server running on port 5000
```

### Step 2: Start the Frontend
```powershell
# In a NEW terminal at project root
npm install
npm run dev
```

**Wait for:**
```
Ready - started server on 0.0.0.0:3000
```

### Step 3: Test "Women World Cup"

#### A. From Home Page
1. Go to http://localhost:3000
2. Type "women world cup" in the search bar
3. Click "Explore" button
4. **Expected:** Redirects to compare page with loading animation

#### B. Compare Page Analysis
**What you should see:**

1. **Loading Phase (5-10 seconds)**
   - "Analyzing 'women world cup' from multiple perspectives..."
   - Spinner animation

2. **Results Phase:**
   - **Real Sources** (Not mock data!)
     - BBC News
     - ESPN
     - The Guardian
     - CNN Sports
     - Reuters
     - And more...

   - **AI Sentiment Analysis**
     - Overall sentiment breakdown (positive/negative/neutral %)
     - Entity-specific sentiments
     - Emotional tone analysis

   - **Dual Perspectives**
     - Left column: Supporting view with real articles
     - Right column: Critical view with real articles
     - Each perspective shows:
       * Real article titles
       * Source names
       * Credibility scores (70-95 range)
       * Key points extracted by AI

   - **Bias Visualization**
     - Coverage tilt indicator
     - Loaded terms highlighted
     - Reasoning for bias classification

   - **Fact Checking**
     - Claims extracted from articles
     - Verifiability scores
     - Claim types (factual/opinion/statistical)

---

## 🔍 What to Look For

### Real Data Indicators:

✅ **Article Titles Are Specific**
- Good: "Women's World Cup 2023: USA vs Netherlands Final Preview"
- Bad: "Women World Cup: Latest developments and analysis - Part 1" (mock)

✅ **Sources Are Recognized**
- Good: BBC News, ESPN, CNN, The Guardian
- Bad: "Example.com" or "Unknown Source"

✅ **URLs Are Real**
- Good: https://www.bbc.com/sport/...
- Bad: https://example.com/article/...

✅ **Sentiment Is Nuanced**
- Good: "Mixed sentiment with optimistic outlook (0.42)"
- Bad: Generic "positive" or "negative"

✅ **Key Points Are Specific**
- Good: "Record attendance expected at Sydney stadium"
- Bad: "Key aspect discussed in this article"

---

## 🎯 Test Scenarios

### Scenario 1: Popular Topic (Fast)
**Search:** "artificial intelligence"
**Expected:** 20-30 articles, 5-10 second analysis
**Should Show:** Tech sources (TechCrunch, Wired, The Verge)

### Scenario 2: Breaking News (Current)
**Search:** "climate change summit"
**Expected:** Recent articles (last 7 days)
**Should Show:** News agencies (Reuters, AP, Bloomberg)

### Scenario 3: Sports Event
**Search:** "women world cup"
**Expected:** Sports sources (ESPN, BBC Sport, Sky Sports)
**Should Show:** Match reports, analysis, statistics

### Scenario 4: Controversial Topic
**Search:** "cryptocurrency regulation"
**Expected:** Divided perspectives
**Should Show:** Clear support/oppose columns with different arguments

---

## 📊 Backend Console Output

When everything works, you'll see in backend terminal:

```
Fetching real news for topic: women world cup
Calling NewsAPI: https://newsapi.org/v2/everything with query: women world cup
NewsAPI returned 28 articles
Successfully fetched 28 articles from NewsAPI
Refreshing analysis for topic "women world cup" (location: global)
OpenRouter request attempt=1 site=http://localhost:3000 model=google/gemini-2.5-flash
```

---

## 🐛 Troubleshooting

### "Backend not available" Error
**Check:**
1. Is backend running? (Terminal 1)
2. Shows port 5000 in use?
3. MongoDB connected?

**Fix:** Restart backend

### Mock Data Still Showing
**Check:**
1. Backend terminal for API errors
2. Browser console (F12) for network errors
3. Check .env files have correct API keys

**Fix:** 
- Verify GOOGLE_NEWS_API_KEY in backend/.env
- Verify OPENROUTER_API_KEY in backend/.env

### Slow Loading (More than 30 seconds)
**Reason:** OpenRouter AI analysis takes time
**Normal:** 5-10 seconds for 20 articles
**Solution:** Be patient, check backend console

### No Articles Found
**Possible Reasons:**
1. NewsAPI rate limit reached (check backend logs)
2. Topic too specific/misspelled
3. No recent articles (last 7 days)

**Try:** 
- Broader search term
- Popular topic
- Check backend terminal for NewsAPI errors

---

## 🎉 Success Checklist

Test passed if you see:

- [ ] Real article titles (not "Part 1, Part 2")
- [ ] Recognized source names (BBC, CNN, etc.)
- [ ] Actual URLs to news sites
- [ ] Specific key points from AI analysis
- [ ] Sentiment scores between -1 and 1
- [ ] Credibility scores between 70-95
- [ ] Loaded terms with context
- [ ] Claims with verifiability scores
- [ ] Different perspectives in two columns
- [ ] Backend logs showing "NewsAPI returned X articles"
- [ ] Backend logs showing "OpenRouter request"

---

## 📈 Performance Metrics

**Expected Performance:**
- News fetch: 1-3 seconds
- AI analysis: 5-10 seconds
- Total time: 6-13 seconds
- Articles analyzed: 20-30
- Perspectives found: 2-4

**If Slower:**
- Check internet connection
- Check API rate limits
- Monitor backend CPU usage

---

## 🔗 Quick Links

- **Frontend:** http://localhost:3000
- **Backend Health:** http://localhost:5000/health
- **API Base:** http://localhost:5000/api

### Test API Directly:
```powershell
# Test news fetch
curl http://localhost:5000/api/news/search?topic=women%20world%20cup

# Test perspective analysis (POST)
curl -X POST http://localhost:5000/api/analysis/compare `
  -H "Content-Type: application/json" `
  -d '{"topic":"women world cup"}'
```

---

## 💡 Tips

1. **First search takes longer** - AI model needs to warm up
2. **Use specific terms** - "women world cup" better than just "sports"
3. **Check backend terminal** - All the action happens there
4. **Browser console** - F12 to see API calls
5. **Be patient** - AI analysis is worth the wait!

---

## 🎊 Expected Output for "Women World Cup"

### Real Articles You Might See:
- "Spain wins Women's World Cup with 1-0 victory over England" - BBC Sport
- "Women's World Cup 2023: Tournament breaks attendance records" - The Guardian
- "FIFA Women's World Cup final: Spain's historic triumph" - ESPN
- "England vs Spain: What we learned from the final" - Sky Sports
- "Women's World Cup prize money: Historic increase announced" - Reuters

### AI Analysis Output:
- **Sentiment:** Mixed (0.35) - Celebratory but discussing challenges
- **Key Points:**
  - Historic achievement for women's football
  - Record-breaking attendance figures
  - Pay equity discussions
  - Future of women's sports
- **Loaded Terms:** "breakthrough", "historic", "controversy"
- **Claims:** "Attendance records broken" (Verifiable: 95%)

---

**Everything is now connected and working! Just start both servers and test!** 🚀
