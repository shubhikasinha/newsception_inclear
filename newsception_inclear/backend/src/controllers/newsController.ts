import { Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import newsService from '../services/newsService';
import mlService from '../services/mlService';
import { cacheGet, cacheSet } from '../config/redis';
import Article from '../models/Article';
import SentimentAnalysis from '../models/SentimentAnalysis';
import BiasAnalysis from '../models/BiasAnalysis';
import Claim from '../models/Claim';
import ClaimVerification from '../models/ClaimVerification';
import SearchHistory from '../models/SearchHistory';
import LocationTrending from '../models/LocationTrending';
import { logger } from '../utils/logger';

const CACHE_TTL = parseInt(process.env.ARTICLE_CACHE_TTL || '3600');

export const searchNews = asyncHandler(async (req: Request, res: Response) => {
  const { topic, location } = req.query;

  if (!topic || typeof topic !== 'string') {
    throw new CustomError('Topic is required', 400);
  }

  // Check cache first
  const cacheKey = `search:${topic}:${location || 'global'}`;
  const cached = await cacheGet(cacheKey);
  
  if (cached) {
    logger.info(`Cache hit for topic: ${topic}`);
    return res.json(JSON.parse(cached));
  }

  // Fetch news articles
  logger.info(`Fetching news for topic: ${topic}`);
  const articles = await newsService.fetchNews(topic, location as string);

  if (articles.length === 0) {
    throw new CustomError('No articles found for this topic', 404);
  }

  // Send to ML service for analysis
  logger.info(`Analyzing ${articles.length} articles`);
  const analyzed = await mlService.analyzeArticles(articles, topic);

  // Save to database
  const savedArticles = [];
  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];
    const analysis = analyzed[i];

    // Check if article already exists
    let dbArticle = await Article.findOne({ url: article.url });
    
    if (!dbArticle) {
      dbArticle = await Article.create({
        topic,
        title: article.title,
        url: article.url,
        source: article.source,
        description: article.description,
        publishedAt: article.publishedAt,
        perspective: analysis.perspective,
        stance: analysis.stance,
        sentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        credibilityScore: analysis.credibilityScore,
        biasScore: analysis.biasScore,
        imageUrl: article.imageUrl,
        author: article.author,
        location: location as string || 'global',
      });

      // Save sentiment analysis
      await SentimentAnalysis.create({
        articleId: dbArticle._id,
        topic,
        overallSentiment: analysis.sentiment,
        sentimentScore: analysis.sentimentScore,
        confidence: 85,
        entities: analysis.entities,
        emotionalTones: analysis.emotionalTones,
        keyTopics: analysis.keyPoints,
      });

      // Save bias analysis
      await BiasAnalysis.create({
        articleId: dbArticle._id,
        topic,
        biasScore: analysis.biasScore,
        coverageTilt: analysis.biasAnalysis.coverageTilt,
        loadedTerms: analysis.biasAnalysis.loadedTerms,
        reasoning: analysis.biasAnalysis.reasoning,
        confidence: 80,
      });

      // Save claims
      for (const claim of analysis.claims) {
        const savedClaim = await Claim.create({
          articleId: dbArticle._id,
          topic,
          claimText: claim.text,
          claimType: claim.type,
          verifiability: claim.verifiability,
          confidence: claim.confidence,
        });

        // Mock claim verification
        await ClaimVerification.create({
          claimId: savedClaim._id,
          topic,
          accuracyScore: claim.verifiability,
          verdict: claim.verifiability > 70 ? 'verified' : 'unverified',
          evidence: [],
          reasoning: 'Automated verification based on source credibility',
          confidence: claim.confidence,
        });
      }
    }

    savedArticles.push(dbArticle);
  }

  // Update search history
  await SearchHistory.findOneAndUpdate(
    { topic },
    {
      $inc: { searchCount: 1 },
      $set: { lastSearchedAt: new Date() },
      $addToSet: { locations: location || 'global' },
    },
    { upsert: true, new: true }
  );

  // Update location trending
  if (location) {
    await LocationTrending.findOneAndUpdate(
      { location: location as string },
      {
        $push: {
          topics: {
            $each: [{ topic, count: 1, lastSeen: new Date() }],
            $slice: -10,
          },
        },
      },
      { upsert: true, new: true }
    );
  }

  // Group by perspective
  const supportArticles = savedArticles.filter(a => a.perspective === 'support');
  const opposeArticles = savedArticles.filter(a => a.perspective === 'oppose');

  const result = {
    topic,
    location: location || 'global',
    perspectives: {
      support: {
        label: supportArticles[0]?.stance || `Supporting ${topic}`,
        articles: supportArticles,
        count: supportArticles.length,
      },
      oppose: {
        label: opposeArticles[0]?.stance || `Critical of ${topic}`,
        articles: opposeArticles,
        count: opposeArticles.length,
      },
    },
    totalSources: savedArticles.length,
    timestamp: new Date().toISOString(),
  };

  // Cache the result
  await cacheSet(cacheKey, JSON.stringify(result), CACHE_TTL);

  return res.json(result);
});

export const getTrendingTopics = asyncHandler(async (req: Request, res: Response) => {
  const { location } = req.query;

  if (location) {
    // Location-specific trending
    const trending = await LocationTrending.findOne({ location: location as string });
    
    if (trending) {
      const topics = trending.topics
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(t => ({
          topic: t.topic,
          heat: Math.min(100, t.count * 10),
        }));
      
      return res.json({ location, topics });
    }
  }

  // Global trending
  const trending = await SearchHistory.find()
    .sort({ searchCount: -1, lastSearchedAt: -1 })
    .limit(10);

  const topics = trending.map(t => ({
    topic: t.topic,
    heat: Math.min(100, t.searchCount * 5),
    searches: t.searchCount,
  }));

  return res.json({ topics });
});
