import { Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import SearchHistory from '../models/SearchHistory';
import LocationTrending from '../models/LocationTrending';
import { analyzeTopic } from '../services/topicAnalysisService';

export const searchNews = asyncHandler(async (req: Request, res: Response) => {
  const { topic, location, refresh } = req.query;

  if (!topic || typeof topic !== 'string') {
    throw new CustomError('Topic is required', 400);
  }

  const analysis = await analyzeTopic(topic, (location as string) || 'global', {
    forceRefresh: refresh === 'true',
  });

  const supportArticles = analysis.groups.support;
  const opposeArticles = analysis.groups.oppose;
  const neutral = analysis.groups?.neutral || [];

  const responsePayload = {
    topic: analysis.topic,
    location: analysis.location,
    refreshed: analysis.refreshed,
    perspectives: {
      support: {
        label: supportArticles[0]?.stance || `Supporting ${analysis.topic}`,
        articles: supportArticles,
        count: supportArticles.length,
      },
      oppose: {
        label: opposeArticles[0]?.stance || `Critical of ${analysis.topic}`,
        articles: opposeArticles,
        count: opposeArticles.length,
      },
      neutral: {
        label: neutral[0]?.stance || `Neutral coverage of ${analysis.topic}`,
        articles: neutral,
        count: neutral.length,
      },
    },
    totalSources: analysis.articles.length,
    timestamp: analysis.lastUpdated?.toISOString() || new Date().toISOString(),
  };

  return res.json(responsePayload);
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
