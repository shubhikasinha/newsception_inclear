# InClear - Balanced News Perspectives Platform

InClear is a comprehensive news analysis platform that provides balanced perspectives on current events through AI-powered analysis. It features dual-perspective news comparison, live audio debates, sentiment analysis, and fact-checking capabilities.

## 🚀 Features

- **Dual Perspective Analysis**: See both sides of every story with AI-powered comparative analysis
- **Live Audio Debates**: Join anonymous real-time audio debates using LiveKit (Twitter Spaces-style)
- **Sentiment Analysis**: Advanced sentiment and bias visualization
- **Fact Checking**: Verify claims with integrated fact-checking
- **Historical Context**: Track how stories evolve over time
- **News Feed**: Personalized trending news from multiple sources

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** (v9.0.0 or higher)
- **MongoDB** (v6.0 or higher) - for backend data storage
- **Redis** (v7.0 or higher) - for caching and rate limiting
- **LiveKit Server** (optional) - for live audio debate functionality

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** with App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Framer Motion** - animations
- **LiveKit Client** - audio streaming
- **Lucide React** - icons

### Backend
- **Node.js** with Express
- **TypeScript**
- **MongoDB** with Mongoose
- **Redis** with ioredis
- **LiveKit Server SDK**
- **Winston** - logging

## 📦 Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd newsception_inclear/newsception_inclear
```

### 2. Frontend Setup

```bash
# Install frontend dependencies
npm install

# Copy environment file
copy .env.example .env.local

# Update .env.local with your configuration
```

#### Frontend Environment Variables (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
```

### 3. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Copy environment file
copy .env.development .env

# Update .env with your configuration
```

#### Backend Environment Variables (`backend/.env`)

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/newsception
REDIS_URL=redis://localhost:6379

# LiveKit
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
LIVEKIT_URL=ws://localhost:7880

# Optional APIs
NEWS_API_KEY=your_news_api_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Database Setup

#### MongoDB
```bash
# Start MongoDB (if installed locally)
mongod

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

#### Redis
```bash
# Start Redis (if installed locally)
redis-server

# Or use Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

### 5. LiveKit Setup (Optional - for Debate Feature)

Download and install LiveKit server from [https://livekit.io/](https://livekit.io/)

```bash
# Run LiveKit server
livekit-server --dev
```

Or use Docker:
```bash
docker run -d -p 7880:7880 -p 7881:7881 --name livekit \
  -e LIVEKIT_API_KEY=devkey \
  -e LIVEKIT_API_SECRET=secret \
  livekit/livekit-server:latest --dev
```

## 🚀 Running the Application

### Development Mode

#### Terminal 1: Start Backend
```bash
cd backend
npm run dev
```

Backend will start on `http://localhost:5000`

#### Terminal 2: Start Frontend
```bash
# From project root
npm run dev
```

Frontend will start on `http://localhost:3000`

### Production Build

#### Build Frontend
```bash
npm run build
npm start
```

#### Build Backend
```bash
cd backend
npm run build
npm start
```

## 📁 Project Structure

```
newsception_inclear/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   └── livekit-token/        # LiveKit token generation
│   ├── components/               # React components
│   │   ├── analysis/             # Analysis components
│   │   ├── compare/              # Comparison views
│   │   ├── dashboard/            # Dashboard components
│   │   ├── debate/               # Debate features
│   │   ├── factcheck/            # Fact-checking
│   │   ├── history/              # Historical data
│   │   └── shared/               # Shared components
│   ├── debate/                   # Debate page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/                   # Shared UI components
│   └── ui/                       # Base UI components
├── lib/                          # Utility libraries
│   ├── api-client.ts             # API client
│   └── utils.ts                  # Helper functions
├── backend/                      # Backend server
│   ├── src/
│   │   ├── config/               # Configuration
│   │   ├── controllers/          # Route controllers
│   │   ├── middleware/           # Express middleware
│   │   ├── models/               # Database models
│   │   ├── routes/               # API routes
│   │   ├── services/             # Business logic
│   │   └── server.ts             # Entry point
│   └── ml-service/               # Python ML service
├── public/                       # Static assets
└── package.json                  # Dependencies
```

## 🔧 Available Scripts

### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript type checking
```

### Backend
```bash
npm run dev          # Start with hot reload
npm run build        # Build TypeScript
npm start            # Start production server
npm test             # Run tests
npm run lint         # Run linting
```

## 🌐 API Endpoints

### News
- `GET /api/news` - Get news feed
- `GET /api/news/search?q=query` - Search news

### Articles
- `GET /api/articles/:id` - Get article by ID
- `GET /api/articles?topic=topic` - Get articles by topic

### Analysis
- `GET /api/analysis/article/:id` - Analyze article
- `POST /api/analysis/compare` - Compare perspectives

### Debate
- `GET /api/debate/rooms` - Get debate rooms
- `POST /api/debate/rooms` - Create debate room
- `POST /api/debate/rooms/:id/join` - Join debate room

## 🎨 UI Components

The project uses custom UI components inspired by shadcn/ui:

- `Button` - Various button styles
- `Input` - Form input fields
- `Badge` - Status badges
- `Label` - Form labels

## 🔒 Security

- CORS enabled for frontend origin
- Helmet.js for security headers
- Rate limiting on API endpoints
- Input validation with Zod
- Environment variable protection

## 🐛 Troubleshooting

### Frontend Issues

**Cannot find module '@/...'**
- Make sure `tsconfig.json` has correct path mappings
- Restart the development server

**Hydration errors**
- Ensure client components use `'use client'` directive
- Check for mismatched server/client rendering

### Backend Issues

**MongoDB connection failed**
- Verify MongoDB is running: `mongosh`
- Check connection string in `.env`

**Redis connection failed**
- Verify Redis is running: `redis-cli ping`
- Check Redis URL in `.env`

**Port already in use**
- Change PORT in `.env` file
- Or kill the process using the port

### LiveKit Issues

**Token generation fails**
- Verify LIVEKIT_API_KEY and LIVEKIT_API_SECRET
- Ensure LiveKit server is running
- Check LIVEKIT_URL matches server address

## 📝 Development Notes

- The frontend uses Next.js 16 with React 19 (latest versions)
- Backend is fully TypeScript with Express
- Database models use Mongoose for MongoDB
- Real-time features powered by LiveKit
- AI analysis can be integrated with OpenAI, Anthropic, or custom ML services

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review the troubleshooting section

## 🚧 Roadmap

- [ ] Integration with real news APIs
- [ ] Enhanced AI models for better analysis
- [ ] Mobile app (React Native)
- [ ] User authentication and profiles
- [ ] Social sharing features
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Browser extension

---

Built with ❤️ for balanced journalism
