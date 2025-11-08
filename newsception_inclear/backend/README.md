# Newsception Backend API

Complete backend API for Newsception - The dual-perspective news analysis platform.

## 🚀 Features

- **News Search & Analysis** - Fetch and analyze news from multiple sources
- **AI-Powered Perspective Analysis** - Automatically categorize articles into supporting/opposing perspectives
- **Sentiment & Bias Detection** - Comprehensive sentiment and bias analysis
- **Claim Verification** - Extract and verify claims from articles
- **Community Fact-Checking** - Gamified user-driven fact-checking system
- **Historical Context** - AI-generated timelines for topics
- **Live Debate Rooms** - Real-time voice debates powered by LiveKit
- **AI Moderation** - Automated content moderation for debates
- **User Preferences & Subscriptions** - Personalized content delivery
- **Location-based Trending** - Geo-specific trending topics

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB Atlas account (or local MongoDB)
- Redis (local or cloud)
- News API keys (optional - works with mock data)
- LiveKit account (optional - for audio debates)
- Python 3.9+ (for ML service)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
```env
# Server
PORT=5000
NODE_ENV=development

# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/newsception

# Redis (optional - works without)
REDIS_URL=redis://localhost:6379

# News APIs (optional - uses mock data if not provided)
GOOGLE_NEWS_API_KEY=your_key
BING_NEWS_API_KEY=your_key

# ML Service (optional - uses mock analysis if not available)
ML_SERVICE_URL=http://localhost:8000

# Auth0 (optional - works in dev mode without)
AUTH0_DOMAIN=dev-xxx.us.auth0.com
AUTH0_AUDIENCE=https://newsception-api
AUTH0_CLIENT_ID=your_client_id

# LiveKit (optional - debates work in simulation mode)
LIVEKIT_URL=wss://your-project.livekit.cloud
LIVEKIT_API_KEY=your_api_key
LIVEKIT_API_SECRET=your_secret

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 3. Start Redis (Local Development)

```bash
# Windows (with Chocolatey)
choco install redis
redis-server

# macOS
brew install redis
brew services start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
```

### 4. Start MongoDB (if using local)

```bash
# Or use MongoDB Atlas (recommended)
mongod --dbpath /path/to/data
```

### 5. Start the Backend

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 🐍 ML Service Setup (Optional)

The backend works with mock analysis if ML service is unavailable. To enable real AI analysis:

```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

See `ml-service/README.md` for details.

## 📡 API Endpoints

### News & Search

- `GET /api/news/search?topic=climate change&location=USA` - Search and analyze news
- `GET /api/news/trending?location=USA` - Get trending topics

### Articles

- `GET /api/articles/:id` - Get article with full analysis
- `GET /api/articles/feed/items?page=1&limit=5` - Get paginated news feed
- `POST /api/articles/feed/generate` - Generate feed from articles

### Analysis

- `GET /api/analysis/historical?topic=AI` - Get historical context
- `POST /api/analysis/factcheck` - Submit fact check
- `POST /api/analysis/factcheck/:id/vote` - Vote on fact check
- `GET /api/analysis/factchecks?claimId=xxx` - Get fact checks

### Debate

- `POST /api/debate/request` - Request debate (auto-creates room at 5 requests)
- `GET /api/debate/requests?topic=xyz` - Get debate request status
- `POST /api/debate/room/:roomId/join` - Join debate room
- `POST /api/debate/room/:roomId/leave` - Leave debate room
- `GET /api/debate/room/:roomId/participants` - Get participants
- `POST /api/debate/moderate` - Apply moderation action
- `GET /api/debate/moderation/logs?roomId=xxx` - Get moderation logs

### User & Subscriptions

- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update preferences
- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Deactivate subscription

### Health Check

- `GET /health` - Server health status

## 🧪 Testing

```bash
# Run tests
npm test

# With coverage
npm run test -- --coverage
```

## 🔒 Security Features

- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Rate Limiting** - Per-endpoint rate limits
- **JWT Authentication** - Auth0 integration (optional)
- **Input Validation** - Zod schema validation
- **Error Handling** - Centralized error middleware

## 📊 Database Models

- **Article** - News articles with AI analysis
- **SentimentAnalysis** - Sentiment scores and entities
- **BiasAnalysis** - Bias detection and loaded terms
- **Claim** - Extracted claims from articles
- **ClaimVerification** - AI verification results
- **FactCheck** - Community fact checks
- **HistoricalContext** - Timeline events
- **SearchHistory** - Trending calculation
- **LocationTrending** - Geo-based trends
- **DebateRoom** - Live debate rooms
- **DebateParticipant** - Participant tracking
- **DebateModeration** - Moderation logs
- **UserPreferences** - User settings
- **Subscription** - Content subscriptions
- **NewsFeedItem** - Dashboard feed

## 🚢 Deployment

### Using Docker

```bash
docker build -t newsception-backend .
docker run -p 5000:5000 --env-file .env newsception-backend
```

### Using Docker Compose

```bash
docker-compose up -d
```

### Manual Deployment

1. Build the project: `npm run build`
2. Set environment variables on your host
3. Start with PM2: `pm2 start dist/server.js --name newsception-api`

## 🐛 Troubleshooting

### Redis Connection Failed
- The app works without Redis (reduced caching)
- Check `REDIS_URL` in `.env`
- Ensure Redis is running: `redis-cli ping`

### MongoDB Connection Error
- Verify `MONGODB_URI` format
- Check network access in MongoDB Atlas
- Whitelist your IP address

### ML Service Timeout
- The app uses mock analysis if ML service unavailable
- Increase timeout in `mlService.ts`
- Check `ML_SERVICE_URL` points to running service

### LiveKit Token Generation Failed
- Debates work in simulation mode without LiveKit
- Verify `LIVEKIT_API_KEY` and `LIVEKIT_API_SECRET`
- Check LiveKit project is active

## 📝 Development Notes

### Mock Data Modes

The backend gracefully degrades when services are unavailable:

- **No News API** → Returns mock articles
- **No ML Service** → Uses rule-based analysis
- **No Redis** → Skips caching (slower but functional)
- **No Auth0** → Development mode (user = 'dev-user')
- **No LiveKit** → Simulation mode for debates

### Adding New Endpoints

1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Create routes in `src/routes/`
4. Import routes in `src/server.ts`

## 📚 Architecture

```
Frontend (Next.js)
    ↓
Express API (Node.js/TypeScript)
    ↓
┌─────────────┬─────────────┬─────────────┐
│   MongoDB   │    Redis    │  ML Service │
│  (Storage)  │  (Cache)    │  (FastAPI)  │
└─────────────┴─────────────┴─────────────┘
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review troubleshooting section above

---

**Built with ❤️ for Base44 Hackathon**
