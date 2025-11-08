# Newsception - The Whole Story in One Place 📰

> **Dual-perspective news analysis platform powered by AI**  
> Base44 Hackathon Project

Newsception solves biased news consumption by showing both sides of every story with a premium, newspaper-like reading experience. Built with Next.js, Express, MongoDB, and AI-powered analysis.

## ✨ Features

- **🔍 Dual Perspective Analysis** - See supporting and opposing viewpoints side-by-side
- **🤖 AI-Powered Insights** - Sentiment analysis, bias detection, claim verification
- **📊 Interactive Visualizations** - Heatmaps, bias charts, distribution graphs
- **🎙️ Live Debate Rooms** - Twitter Spaces-style audio debates with AI moderation
- **✅ Community Fact-Checking** - Gamified verification system with credibility points
- **📜 Historical Context** - AI-generated timelines showing story development
- **📍 Location-Based Trending** - Geo-specific trending topics
- **📰 Infinite News Feed** - LinkedIn-style continuous feed
- **🎨 Premium UI** - Elegant newspaper aesthetic with neumorphic design
- **🌙 Dark Mode** - Beautiful dark theme support

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (Atlas or local)
- Python 3.9+ (for ML service)
- Redis (optional, improves performance)

### One-Command Start (Windows)

```bash
start-backend.bat
```

### Manual Setup

```bash
# Backend setup
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB connection string

# Start ML service (separate terminal)
cd ml-service
pip install -r requirements.txt
python main.py

# Start backend (separate terminal)
cd backend
npm run dev

# Frontend setup (separate terminal)
cd ..
npm install
npm run dev
```

**Or use Docker:**

```bash
cd backend
docker-compose up -d
```

### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **ML Service**: http://localhost:8000

## 📚 Documentation

- [**Implementation Guide**](IMPLEMENTATION.md) - Complete setup & deployment guide
- [**Backend README**](backend/README.md) - API documentation & troubleshooting
- [**Tasks Overview**](tasks.md) - Development roadmap

## 🏗️ Architecture

```
Frontend (Next.js/React)
    ↓
Express API (Node.js)
    ↓
┌─────────────┬─────────────┬─────────────┐
│   MongoDB   │    Redis    │  FastAPI    │
│  (Storage)  │   (Cache)   │  (ML/AI)    │
└─────────────┴─────────────┴─────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 + React
- **Styling**: Tailwind CSS + Neumorphic UI
- **Charts**: Recharts
- **Audio**: LiveKit Client
- **Fonts**: Playfair Display, Crimson Text, Inter

### Backend
- **Runtime**: Node.js 18 + TypeScript
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Cache**: Redis + ioredis
- **Auth**: Auth0 + JWT
- **Real-time**: LiveKit Server SDK

### ML Service
- **Framework**: FastAPI + Python
- **NLP**: (Production: HuggingFace transformers, spaCy)
- **Current**: Rule-based mock analysis

## 📡 API Endpoints

### News & Search
- `GET /api/news/search?topic=xyz` - Search and analyze news
- `GET /api/news/trending` - Get trending topics

### Articles
- `GET /api/articles/:id` - Get article with analysis
- `GET /api/articles/feed/items` - Paginated news feed

### Analysis
- `GET /api/analysis/historical?topic=xyz` - Historical timeline
- `POST /api/analysis/factcheck` - Submit fact check
- `GET /api/analysis/factchecks?claimId=xyz` - Get fact checks

### Debate
- `POST /api/debate/request` - Request live debate
- `POST /api/debate/room/:id/join` - Join debate room
- `GET /api/debate/room/:id/participants` - Get participants

### User
- `GET /api/user/preferences` - User preferences
- `GET /api/subscriptions` - Content subscriptions

[See full API documentation](backend/README.md)

## 🎯 Key Features Explained

### Dual Perspective Analysis

When you search a topic, Newsception:
1. Fetches 20-25 articles from multiple sources
2. Sends to ML service for AI analysis
3. Categorizes into supporting/opposing perspectives
4. Generates summaries, key points, sentiment scores
5. Detects bias and loaded language
6. Extracts and verifies claims
7. Displays side-by-side comparison

### Smart Categorization

Unlike simple left/right bias detection, our AI determines the **natural dividing line** for each topic:

- **Climate**: "Urgent action" vs "Measured approach"
- **Tech**: "Innovation" vs "Regulation"
- **Economy**: "Growth-focused" vs "Sustainability-focused"

### Live Debates

- Users request debates on topics
- Room auto-creates when 5+ people request
- Choose Side A or Side B based on perspectives
- Real-time audio powered by LiveKit
- AI moderates for hate speech, attacks
- Tracks speaking time and warnings

### Community Fact-Checking

- AI extracts claims from articles
- Users vote: Accurate, Misleading, False
- Provide evidence and sources
- Earn credibility points
- Gamified leaderboard
- Admin verification system

## 🔐 Security Features

- Helmet for security headers
- CORS protection
- Rate limiting (per-endpoint)
- JWT authentication
- Input validation (Zod)
- MongoDB injection protection
- XSS protection
- Environment variable security

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# With coverage
npm test -- --coverage

# API health check
curl http://localhost:5000/health
```

## 🚢 Deployment

### Backend (Render/DigitalOcean)

```bash
# Build
npm run build

# Deploy with environment variables
npm start
```

### Frontend (Vercel/Netlify)

```bash
# Vercel
vercel deploy

# Netlify
netlify deploy
```

### Docker (All Services)

```bash
cd backend
docker-compose up -d
```

[See detailed deployment guide](IMPLEMENTATION.md)

## 🐛 Troubleshooting

### Backend Won't Start
- Check MongoDB connection string in `.env`
- Verify Node.js version: `node --version` (need 18+)
- Check if port 5000 is available

### Returns Mock Data
- **This is expected** without API keys!
- Add news API key to `.env` for real data
- Ensure ML service is running on port 8000

### Database Errors
- Check MongoDB Atlas IP whitelist (add 0.0.0.0/0 for testing)
- Verify username/password in connection string
- Test connection with MongoDB Compass

### CORS Errors
- Update `FRONTEND_URL` in backend `.env`
- Check CORS settings in `server.ts`

[See full troubleshooting guide](IMPLEMENTATION.md#troubleshooting)

## 📊 Database Schema

**16 MongoDB Collections:**

- **Article** - News articles with AI analysis
- **SentimentAnalysis** - Sentiment scores, entities, tones
- **BiasAnalysis** - Bias scores, loaded terms, reasoning
- **Claim** - Extracted claims from articles
- **ClaimVerification** - AI verification results
- **FactCheck** - Community fact-check submissions
- **HistoricalContext** - Timeline events for topics
- **SearchHistory** - Trending calculation data
- **LocationTrending** - Geo-based trending topics
- **DebateRoom** - Live debate room metadata
- **DebateParticipant** - Participant tracking
- **DebateModeration** - AI moderation logs
- **DebateRequest** - Debate request queue
- **UserPreferences** - User settings
- **Subscription** - Content subscriptions
- **NewsFeedItem** - Dashboard feed items

## 🎨 UI/UX Highlights

- **Neumorphic Design** - Soft, tactile elements with dual shadows
- **Newspaper Aesthetic** - Serif headlines, clean body text, elegant spacing
- **Premium Microanimations** - Subtle hover effects, smooth transitions
- **Responsive Design** - Mobile-first, works on all devices
- **Dark Mode** - Beautiful dark theme throughout
- **Accessibility** - WCAG 2.1 AA compliance

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request

## 📝 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- Built for Base44 Hackathon 2024
- Inspired by The New York Times, The Atlantic, WSJ
- LiveKit for audio infrastructure
- MongoDB Atlas for database hosting
- FastAPI for ML service framework

## 🆘 Support

For questions or support:
- 📖 Check [Implementation Guide](IMPLEMENTATION.md)
- 📖 Review [Backend Docs](backend/README.md)
- 🐛 Open an issue on GitHub
- 📧 Contact the team

## 🚀 Roadmap

- [ ] Real NLP models (replace mock analysis)
- [ ] User authentication flow
- [ ] Email notifications for subscriptions
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] API rate limit dashboard
- [ ] Admin moderation dashboard
- [ ] Analytics and insights
- [ ] Multi-language support
- [ ] Voice-to-text for debates

---

**Built with ❤️ for Base44 Hackathon**  
*"The Whole Story in One Place"*
