import { Types } from 'mongoose';
import newsService from './newsService';
import mlService from './mlService';
import Article, { IArticle } from '../models/Article';
import SentimentAnalysis from '../models/SentimentAnalysis';
import BiasAnalysis from '../models/BiasAnalysis';
import Claim from '../models/Claim';
import ClaimVerification from '../models/ClaimVerification';
import SearchHistory from '../models/SearchHistory';
import LocationTrending from '../models/LocationTrending';
import NewsFeedItem from '../models/NewsFeedItem';
import { logger } from '../utils/logger';

const ANALYSIS_TTL_SECONDS = parseInt(process.env.TOPIC_ANALYSIS_TTL || '3600', 10);

type PerspectiveKey = 'support' | 'oppose' | 'neutral';

export interface TopicAnalysisResult {
  topic: string;
  location: string;
  refreshed: boolean;
  articles: IArticle[];
  groups: Record<PerspectiveKey, IArticle[]>;
  claims: Awaited<ReturnType<typeof Claim.find>>;
  sentiments: Awaited<ReturnType<typeof SentimentAnalysis.find>>;
  biases: Awaited<ReturnType<typeof BiasAnalysis.find>>;
  lastUpdated: Date | null;
}

interface AnalyzeTopicOptions {
  forceRefresh?: boolean;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const upsertArticleAnalysis = async (
  topic: string,
  location: string,
  article: any,
  analysis: Awaited<ReturnType<typeof mlService.analyzeArticles>>[number],
) => {
  const update = {
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
    location,
  };

  const savedArticle = await Article.findOneAndUpdate(
    { url: article.url },
    update,
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await SentimentAnalysis.findOneAndUpdate(
    { articleId: savedArticle._id },
    {
      articleId: savedArticle._id,
      topic,
      overallSentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      confidence: analysis.sentimentScore >= 0 ? 80 : 70,
      entities: analysis.entities,
      emotionalTones: analysis.emotionalTones,
      keyTopics: analysis.keyPoints,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await BiasAnalysis.findOneAndUpdate(
    { articleId: savedArticle._id },
    {
      articleId: savedArticle._id,
      topic,
      biasScore: analysis.biasScore,
      coverageTilt: analysis.biasAnalysis.coverageTilt,
      loadedTerms: analysis.biasAnalysis.loadedTerms,
      reasoning: analysis.biasAnalysis.reasoning,
      confidence: 80,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  await Promise.all(
    analysis.claims.map(async (claim) => {
      const claimDoc = await Claim.findOneAndUpdate(
        {
          articleId: savedArticle._id,
          claimText: claim.text,
        },
        {
          topic,
          claimText: claim.text,
          claimType: claim.type,
          verifiability: claim.verifiability,
          confidence: claim.confidence,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );

      await ClaimVerification.findOneAndUpdate(
        { claimId: claimDoc._id },
        {
          claimId: claimDoc._id,
          topic,
          accuracyScore: Math.round(claim.verifiability),
          verdict: claim.verifiability > 70 ? 'verified' : claim.verifiability > 40 ? 'partially_verified' : 'unverified',
          evidence: [],
          reasoning: 'Initial automated assessment based on source credibility and claim structure.',
          confidence: claim.confidence,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      );
    }),
  );

  return savedArticle;
};

const updateSearchHistory = async (topic: string, location: string) => {
  await SearchHistory.findOneAndUpdate(
    { topic },
    {
      $inc: { searchCount: 1 },
      $set: { lastSearchedAt: new Date() },
      $addToSet: { locations: location || 'global' },
    },
    { upsert: true },
  );

  if (location) {
    await LocationTrending.findOneAndUpdate(
      { location },
      {
        $push: {
          topics: {
            $each: [{ topic, count: 1, lastSeen: new Date() }],
            $slice: -20,
          },
        },
      },
      { upsert: true },
    );
  }
};

const updateNewsFeed = async (topic: string, location: string, articles: IArticle[]) => {
  if (!articles.length) return;

  const sortedByCredibility = [...articles].sort((a, b) => (b.credibilityScore ?? 0) - (a.credibilityScore ?? 0));
  const headlineArticle = sortedByCredibility[0];
  const perspectives = Array.from(new Set(articles.map((item) => item.stance))).filter(Boolean);

  await NewsFeedItem.findOneAndUpdate(
    { topic },
    {
      topic,
      headline: headlineArticle.title,
      summary: headlineArticle.summary,
      perspectiveCount: perspectives.length || 2,
      perspectives,
      sourceCount: articles.length,
      trendingScore: articles.length,
      category: headlineArticle.category || 'General',
      location: location || 'global',
      imageUrl: headlineArticle.imageUrl,
      publishedAt: headlineArticle.publishedAt,
    },
    { upsert: true },
  );
};

export const analyzeTopic = async (
  inputTopic: string,
  location = 'global',
  options: AnalyzeTopicOptions = {},
): Promise<TopicAnalysisResult> => {
  const topic = inputTopic.trim();
  if (!topic) {
    throw new Error('Topic is required');
  }

  const regexTopic = new RegExp(`^${escapeRegExp(topic)}$`, 'i');
  const articleQuery = { topic: regexTopic };
  const existingArticles = await Article.find(articleQuery).sort({ updatedAt: -1 });
  const latestArticle = existingArticles[0];

  const isStale = (() => {
    if (!latestArticle) return true;
    if (options.forceRefresh) return true;
    const ttlMs = ANALYSIS_TTL_SECONDS * 1000;
    return Date.now() - latestArticle.updatedAt.getTime() > ttlMs;
  })();

  let articles: IArticle[] = existingArticles;
  let refreshed = false;

  if (isStale) {
    logger.info(`Refreshing analysis for topic "${topic}" (location: ${location})`);
    const fetchedArticles = await newsService.fetchNews(topic, location);

    if (!fetchedArticles.length) {
      logger.warn(`No articles fetched for topic "${topic}"`);
    } else {
      const analysisResults = await mlService.analyzeArticles(fetchedArticles, topic);
      const persistedArticles: IArticle[] = [];

      for (let i = 0; i < fetchedArticles.length; i += 1) {
        try {
          const saved = await upsertArticleAnalysis(topic, location, fetchedArticles[i], analysisResults[i]);
          persistedArticles.push(saved);
        } catch (error) {
          logger.error('Failed to persist analyzed article', {
            topic,
            url: fetchedArticles[i]?.url,
            error,
          });
        }
      }

      articles = persistedArticles;
      refreshed = true;
      await updateSearchHistory(topic, location);
      await updateNewsFeed(topic, location, persistedArticles);
    }
  }

  const articleIds = articles.map((doc) => doc._id as Types.ObjectId);

  const [claims, sentiments, biases] = await Promise.all([
    Claim.find({ articleId: { $in: articleIds } }).limit(100),
    SentimentAnalysis.find({ articleId: { $in: articleIds } }),
    BiasAnalysis.find({ articleId: { $in: articleIds } }),
  ]);

  const groups: Record<PerspectiveKey, IArticle[]> = {
    support: [],
    oppose: [],
    neutral: [],
  };

  articles.forEach((doc) => {
    if (doc.perspective === 'support') {
      groups.support.push(doc);
    } else if (doc.perspective === 'oppose') {
      groups.oppose.push(doc);
    } else {
      groups.neutral.push(doc);
    }
  });

  return {
    topic,
    location,
    refreshed,
    articles,
    groups,
    claims,
    sentiments,
    biases,
    lastUpdated: articles[0]?.updatedAt ?? null,
  };
};
