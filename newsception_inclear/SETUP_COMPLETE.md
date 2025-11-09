# 🚀 Newsception - Complete Setup Guide

## ✅ What's Been Fixed

1. **All TypeScript files converted to JSX** ✓
2. **Tailwind CSS configuration fixed** ✓
3. **Backend integration layer created** ✓
4. **API proxy routes for backend** ✓
5. **Frontend pages integrated with backend** ✓
6. **Debate system working** ✓

## 🏗️ Architecture

### Frontend (Next.js)
- **Location**: Root directory
- **Port**: 3000
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + Framer Motion

### Backend (Express/TypeScript)
- **Location**: `/backend`
- **Port**: 5000
- **Framework**: Express.js + TypeScript
- **Database**: MongoDB
- **Cache**: Redis

### ML Service (Python/FastAPI)
- **Location**: `/backend/ml-service`
- **Port**: 8000
- **Framework**: FastAPI

## 📦 Installation

### 1. Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file (see backend/.env.example)
cp .env.example .env

# Start development server
npm run dev
```

### 3. ML Service Setup (Optional)

```bash
cd backend/ml-service

# Install Python dependencies
pip install -r requirements.txt

# Start ML service
uvicorn main:app --reload --port 8000
```

### 4. Environment Variables

Create `.env.local` in the root directory:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud

# LiveKit
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
LIVEKIT_URL=wss://your-project.livekit.cloud

# Backend
BACKEND_URL=http://localhost:5000

# OpenAI (optional)
OPENAI_API_KEY=your_key
```

## 🎯 Features Implemented

### ✅ News Aggregation & Analysis
- **Dashboard** (`/dashboard`) - News feed with trending topics
- **Compare** (`/compare?topic=...`) - Dual perspective analysis
- **Search** - Real-time news search with AI analysis
- **Trending Topics** - Location-based trending news

### ✅ AI Analysis Features
- **Sentiment Analysis** - Positive/negative/neutral classification
- **Stance Detection** - Support/oppose/neutral identification
- **Bias Detection** - Loaded language and bias scoring
- **Claim Extraction** - Key claims from articles
- **Historical Context** - Timeline of related events
- **Fact Checking** - Community-driven fact verification

### ✅ Debate System
- **Homepage** (`/`) - Trending topics and live debates
- **Debate Rooms** (`/debate/[id]`) - Join debates with side selection
- **Audience View** (`/audience/[id]`) - View-only livestream
- **AI Moderation** - Real-time moderation with OpenAI integration
- **Live Polling** - Real-time voting on debate sides

### ✅ UI Components
- **Newspaper-style design** - Serif fonts, ivory background, gold accents
- **Split-screen layout** - Two-column perspective view
- **Micro-animations** - Framer Motion animations
- **Responsive design** - Mobile-friendly layouts

## 🔌 API Integration

### Frontend → Backend

The frontend uses an API proxy pattern:

1. **Direct API calls** via `/app/lib/api.js` (apiClient)
2. **Proxy routes** via `/app/api/backend/[...path]/route.js`
3. **Fallback** to local Next.js API routes if backend unavailable

### API Endpoints

#### News & Search
- `GET /api/news/search?topic=...&location=...`
- `GET /api/news/trending?location=...`

#### Articles
- `GET /api/articles/:id`
- `GET /api/articles/feed/items?page=...&limit=...`

#### Analysis
- `GET /api/analysis/historical?topic=...`
- `POST /api/analysis/factcheck`
- `GET /api/analysis/factchecks?claimId=...`

#### Debate
- `POST /api/debate/request`
- `GET /api/debate/requests?topic=...`
- `POST /api/debate/room/:roomId/join`
- `GET /api/debate/room/:roomId/participants`

## 🚦 Running the Application

### Development Mode

**Terminal 1 - Frontend:**
```bash
npm run dev
```

**Terminal 2 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 - ML Service (Optional):**
```bash
cd backend/ml-service
uvicorn main:app --reload --port 8000
```

### Access Points

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000
- **Health Check**: http://localhost:5000/health

## 🐛 Troubleshooting

### Issue: "Cannot find module '@tailwindcss/postcss'"
**Solution**: Already fixed. Removed from package.json.

### Issue: "Backend connection failed"
**Solution**: 
1. Ensure backend is running on port 5000
2. Check `BACKEND_URL` in `.env.local`
3. Frontend will fallback to local APIs if backend unavailable

### Issue: "MongoDB connection failed"
**Solution**: 
1. Ensure MongoDB is running
2. Check `MONGODB_URI` in `backend/.env`
3. Backend will work with mock data if DB unavailable

### Issue: "LiveKit errors"
**Solution**:
1. Get free LiveKit credentials from https://livekit.io
2. Add to `.env.local`
3. Debates work in simulation mode without LiveKit

## 📝 Next Steps

1. **Configure MongoDB** - Set up MongoDB Atlas or local instance
2. **Configure Redis** - Set up Redis for caching
3. **Get LiveKit credentials** - Sign up at livekit.io
4. **Optional: OpenAI API** - For enhanced AI moderation
5. **Deploy** - Use Vercel (frontend) + Railway/Render (backend)

## 🎨 Design System

- **Fonts**: Georgia, Times New Roman (serif)
- **Colors**: 
  - Background: `#fafafa` (ivory)
  - Text: `#1a1a1a` (black)
  - Accent: `#d4af37` (gold)
  - Side A: `#2c3e50` (dark blue)
  - Side B: `#8b0000` (dark red)
- **Layout**: Two-column split-screen for perspectives

## 🔒 Security

- CORS enabled for frontend
- Rate limiting on backend
- Helmet security headers
- Input validation with Zod
- JWT authentication (optional Auth0)

## 📚 Documentation

- **Backend API**: See `backend/README.md`
- **ML Service**: See `backend/ml-service/README.md`
- **Components**: See component files in `app/components/`

---

**Status**: ✅ Fully Working
**Last Updated**: 2025-01-XX

