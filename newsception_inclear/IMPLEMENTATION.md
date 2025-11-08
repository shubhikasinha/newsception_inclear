# Newsception Implementation Guide

## 🎯 Complete Setup & Deployment Guide

This guide walks you through setting up the entire Newsception application from scratch.

---

## 📁 Project Structure

```
newsception_inclear/
├── app/                          # Frontend (Next.js/React)
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   ├── entities/                 # Data models (Base44 format)
│   └── ...
├── backend/                      # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── models/               # MongoDB models
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   ├── middleware/           # Auth, errors, rate limiting
│   │   ├── config/               # DB, Redis config
│   │   └── server.ts             # Main entry point
│   ├── ml-service/               # Python FastAPI ML service
│   │   ├── main.py               # ML endpoints
│   │   └── requirements.txt
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start (5 Minutes)

### Option 1: Docker (Recommended)

```bash
# 1. Navigate to backend
cd backend

# 2. Copy environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Check status
docker-compose ps

# Backend API: http://localhost:5000
# ML Service: http://localhost:8000
# MongoDB: localhost:27017
# Redis: localhost:6379
```

### Option 2: Manual Setup

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# ML Service (separate terminal)
cd backend/ml-service
pip install -r requirements.txt
python main.py

# Frontend (separate terminal)
cd ..
npm install
npm run dev
```

---

## ⚙️ Detailed Setup Instructions

### 1. Prerequisites

Install these before starting:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB** ([MongoDB Atlas](https://www.mongodb.com/cloud/atlas) recommended)
- **Redis** (optional, works without)
- **Python** 3.9+ (for ML service)
- **Git** for version control

### 2. MongoDB Setup

#### Option A: MongoDB Atlas (Cloud - Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create new cluster (M0 free tier)
4. Database Access → Add User (username + password)
5. Network Access → Add IP (0.0.0.0/0 for testing)
6. Connect → Get connection string
7. Update `.env`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/newsception?retryWrites=true
   ```

#### Option B: Local MongoDB

```bash
# Windows (Chocolatey)
choco install mongodb

# macOS
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB
mongod --dbpath C:\data\db  # Windows
mongod --dbpath /usr/local/var/mongodb  # macOS

# In .env:
MONGODB_URI=mongodb://localhost:27017/newsception
```

### 3. Redis Setup (Optional - improves performance)

```bash
# Windows
choco install redis-64
redis-server

# macOS
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 --name redis redis:alpine

# In .env:
REDIS_URL=redis://localhost:6379
```

### 4. Backend Configuration

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
```

**Edit `.env`:**

```env
# Required
PORT=5000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
FRONTEND_URL=http://localhost:3000

# Optional (uses mock data if not provided)
GOOGLE_NEWS_API_KEY=your_key_from_newsapi.org
BING_NEWS_API_KEY=your_key_from_azure
ML_SERVICE_URL=http://localhost:8000
REDIS_URL=redis://localhost:6379

# Auth0 (optional - works in dev mode without)
AUTH0_DOMAIN=your-domain.us.auth0.com
AUTH0_AUDIENCE=https://newsception-api
AUTH0_CLIENT_ID=your_client_id

# LiveKit (optional - debates work without)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_secret
```

### 5. ML Service Setup

```bash
cd backend/ml-service

# Create virtual environment
python -m venv venv

# Activate
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run
python main.py
```

### 6. Start Backend API

```bash
cd backend

# Development mode (auto-reload)
npm run dev

# Production mode
npm run build
npm start
```

**Verify:**
- Health check: http://localhost:5000/health
- Should see: `{"status":"ok","timestamp":"..."}"`

### 7. Test API Endpoints

```bash
# Search news (uses mock data initially)
curl "http://localhost:5000/api/news/search?topic=climate+change"

# Get trending topics
curl "http://localhost:5000/api/news/trending"

# Health check
curl "http://localhost:5000/health"
```

---

## 🔌 External API Configuration

### News APIs

#### Option 1: NewsAPI.org (Easier)

1. Go to [newsapi.org](https://newsapi.org/)
2. Sign up for free (500 requests/day)
3. Get API key
4. Add to `.env`:
   ```
   GOOGLE_NEWS_API_KEY=your_newsapi_key
   ```

#### Option 2: Bing News Search API

1. Create [Azure account](https://azure.microsoft.com/)
2. Create Bing Search v7 resource
3. Copy API key
4. Add to `.env`:
   ```
   BING_NEWS_API_KEY=your_azure_key
   ```

**Note:** Backend works with mock data if no API keys provided!

### Auth0 Setup (Optional)

1. Go to [auth0.com](https://auth0.com/)
2. Create free account
3. Applications → Create Application → Single Page Application
4. Settings:
   - Allowed Callback URLs: `http://localhost:3000`
   - Allowed Web Origins: `http://localhost:3000`
   - Copy Domain, Client ID
5. APIs → Create API
   - Identifier: `https://newsception-api`
   - Copy identifier
6. Update `.env` with values

### LiveKit Setup (Optional)

1. Go to [livekit.io](https://livekit.io/)
2. Sign up for free
3. Create project
4. Copy WebSocket URL, API Key, API Secret
5. Add to `.env`

---

## 🔗 Frontend Integration

The frontend needs to connect to your backend. Update the frontend code:

### 1. Create API Client

Create `app/services/api.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const api = {
  // News
  searchNews: async (topic: string, location?: string) => {
    const params = new URLSearchParams({ topic });
    if (location) params.append('location', location);
    const res = await fetch(`${API_BASE_URL}/news/search?${params}`);
    return res.json();
  },

  getTrending: async (location?: string) => {
    const params = location ? `?location=${location}` : '';
    const res = await fetch(`${API_BASE_URL}/news/trending${params}`);
    return res.json();
  },

  // Articles
  getArticle: async (id: string) => {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`);
    return res.json();
  },

  getNewsFeed: async (page = 1, limit = 5, location?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (location) params.append('location', location);
    const res = await fetch(`${API_BASE_URL}/articles/feed/items?${params}`);
    return res.json();
  },

  // Debate
  requestDebate: async (topic: string, articleId?: string, side?: string) => {
    const res = await fetch(`${API_BASE_URL}/debate/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, articleId, side }),
    });
    return res.json();
  },

  // More endpoints...
};
```

### 2. Environment Variables

Create `.env.local` in frontend root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud
```

### 3. Update Components

Replace mock data with real API calls:

**Example - Compare Page:**

```typescript
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export default function Compare({ topic }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const result = await api.searchNews(topic);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [topic]);

  if (loading) return <LoadingState />;
  if (!data) return <ErrorState />;

  return (
    // Your UI with real data
    <div>...</div>
  );
}
```

---

## 🐳 Docker Deployment

### Local Development with Docker

```bash
cd backend

# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
docker-compose logs -f ml-service

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build
```

### Production Deployment

#### Option 1: Docker Hub + VPS

```bash
# Build and push
docker build -t yourusername/newsception-backend:latest .
docker push yourusername/newsception-backend:latest

# On your server
docker pull yourusername/newsception-backend:latest
docker run -d \
  -p 5000:5000 \
  --env-file .env \
  --name newsception-api \
  yourusername/newsception-backend:latest
```

#### Option 2: Render.com

1. Push code to GitHub
2. Go to [render.com](https://render.com/)
3. New → Web Service
4. Connect repository
5. Settings:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. Add environment variables
7. Deploy!

#### Option 3: DigitalOcean App Platform

1. Push to GitHub
2. Create new App
3. Select repository
4. Add environment variables
5. Deploy

---

## 🧪 Testing

### API Testing with cURL

```bash
# Search
curl "http://localhost:5000/api/news/search?topic=ai"

# Debate request
curl -X POST http://localhost:5000/api/debate/request \
  -H "Content-Type: application/json" \
  -d '{"topic":"climate change"}'

# Fact check
curl -X POST http://localhost:5000/api/analysis/factcheck \
  -H "Content-Type: application/json" \
  -d '{"claimId":"xxx","vote":"accurate","evidence":"Test evidence"}'
```

### API Testing with Postman

1. Import this collection URL: (create a Postman collection)
2. Set base URL variable: `{{base_url}}` = `http://localhost:5000/api`
3. Test all endpoints

### Unit Tests

```bash
cd backend
npm test

# With coverage
npm test -- --coverage
```

---

## 🔧 Troubleshooting

### Backend won't start

**Check Node version:**
```bash
node --version  # Should be 18+
```

**Check MongoDB connection:**
```bash
# Test MongoDB
mongosh "your_connection_string"
```

**Check port availability:**
```bash
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i :5000
```

### Database errors

**MongoDB connection failed:**
- Verify connection string format
- Check MongoDB Atlas IP whitelist
- Ensure username/password are correct
- Test connection with MongoDB Compass

**Redis connection failed:**
- Backend works without Redis (just slower)
- Check if Redis is running: `redis-cli ping`
- Should return: `PONG`

### API returns mock data

This is **expected behavior** when external services aren't configured!

The backend gracefully falls back to:
- Mock news articles (if no news API)
- Mock analysis (if ML service unavailable)
- Cached data (to reduce API calls)

To use real data:
1. Add news API key to `.env`
2. Start ML service on port 8000
3. Restart backend

### CORS errors in frontend

Add to backend `.env`:
```env
FRONTEND_URL=http://localhost:3000
```

Or update `cors` configuration in `server.ts`.

---

## 📊 Monitoring & Logs

### View Logs

```bash
# Development
tail -f logs/combined.log
tail -f logs/error.log

# Docker
docker-compose logs -f backend
```

### Health Checks

```bash
# Backend
curl http://localhost:5000/health

# ML Service
curl http://localhost:8000/health

# MongoDB
mongosh --eval "db.adminCommand('ping')"

# Redis
redis-cli ping
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use strong MongoDB password
- [ ] Enable Redis for caching
- [ ] Add real news API keys
- [ ] Configure Auth0 properly
- [ ] Set up SSL/HTTPS
- [ ] Configure rate limiting
- [ ] Set up error monitoring (Sentry)
- [ ] Enable logging (Winston → cloud service)
- [ ] Set up backups for MongoDB
- [ ] Configure CORS for production domain
- [ ] Add health check endpoints to load balancer
- [ ] Set up CI/CD pipeline
- [ ] Add API documentation (Swagger)
- [ ] Performance testing
- [ ] Security audit

---

## 📚 Next Steps

1. **Connect Frontend**: Update all frontend pages to use real API
2. **Add Authentication**: Implement Auth0 login flow
3. **Test Features**: Test each feature end-to-end
4. **Add Analytics**: Track usage with Google Analytics
5. **Optimize Performance**: Add caching, CDN, image optimization
6. **Deploy**: Deploy to production hosting
7. **Monitor**: Set up error tracking and monitoring

---

## 🆘 Support

**Common Issues:**
- Check `backend/README.md` for troubleshooting
- Review `ml-service/README.md` for ML setup
- Check GitHub issues for known problems

**Get Help:**
- Open issue on GitHub
- Check documentation
- Review API responses for error messages

---

## 🎉 Success Checklist

Your setup is complete when:

- [x] `http://localhost:5000/health` returns `{"status":"ok"}`
- [x] `http://localhost:8000/health` returns `{"status":"healthy"}`
- [x] News search returns articles (mock or real)
- [x] Trending topics load
- [x] Debate requests work
- [x] No errors in console/logs
- [x] Frontend connects to backend
- [x] All features functional

**You're ready to go! 🚀**

---

Built with ❤️ for Base44 Hackathon
