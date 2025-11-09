import { Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import mlService from '../services/mlService';
import HistoricalContext from '../models/HistoricalContext';
import FactCheck from '../models/FactCheck';
import Claim, { IClaim } from '../models/Claim';
import { analyzeTopic } from '../services/topicAnalysisService';

export const getHistoricalContext = asyncHandler(async (req: Request, res: Response) => {
  const { topic } = req.query;

  if (!topic || typeof topic !== 'string') {
    throw new CustomError('Topic is required', 400);
  }

  // Check database first
  let context = await HistoricalContext.findOne({ topic });

  if (!context) {
    // Generate new context
    const data = await mlService.getHistoricalContext(topic);
    
    context = await HistoricalContext.create({
      topic,
      events: data.events,
      keyDevelopments: data.keyDevelopments,
      relatedTopics: data.relatedTopics,
    });
  }

  res.json(context);
});

export const submitFactCheck = asyncHandler(async (req: Request, res: Response) => {
  const { claimId, vote, evidence, sources } = req.body;
  const userId = req.auth?.sub || 'anonymous';

  if (!claimId || !vote || !evidence) {
    throw new CustomError('Missing required fields', 400);
  }

  // Verify claim exists
  const claim = await Claim.findById(claimId);
  if (!claim) {
    throw new CustomError('Claim not found', 404);
  }

  // Calculate credibility points
  let credibilityPoints = 20; // Base points
  if (sources && sources.length > 0) {
    credibilityPoints += sources.length * 10; // 10 points per source
  }

  const factCheck = await FactCheck.create({
    claimId,
    userId,
    vote,
    evidence,
    sources: sources || [],
    credibilityPoints,
  });

  res.status(201).json({
    success: true,
    factCheck,
    message: 'Fact check submitted successfully',
  });
});

export const voteFactCheck = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { voteType } = req.body; // 'upvote' or 'downvote'

  if (!['upvote', 'downvote'].includes(voteType)) {
    throw new CustomError('Invalid vote type', 400);
  }

  const factCheck = await FactCheck.findById(id);
  if (!factCheck) {
    throw new CustomError('Fact check not found', 404);
  }

  if (voteType === 'upvote') {
    factCheck.upvotes += 1;
    factCheck.credibilityPoints += 5;
  } else {
    factCheck.downvotes += 1;
    factCheck.credibilityPoints = Math.max(0, factCheck.credibilityPoints - 2);
  }

  await factCheck.save();

  res.json({
    success: true,
    factCheck,
  });
});

export const getFactChecks = asyncHandler(async (req: Request, res: Response) => {
  const { claimId } = req.query;

  if (!claimId) {
    throw new CustomError('Claim ID is required', 400);
  }

  const factChecks = await FactCheck.find({ claimId })
    .sort({ credibilityPoints: -1, upvotes: -1 });

  res.json({
    factChecks,
    count: factChecks.length,
  });
});

const aggregateKeyPoints = (articles: any[]) => {
  const points = new Set<string>();
  articles.forEach((article) => {
    (article.keyPoints || []).forEach((point: string) => {
      if (points.size < 10 && point) {
        points.add(point);
      }
    });
  });
  return Array.from(points);
};

const mapPerspective = (label: string, articles: any[], fallbackPrefix: string) => {
  if (!articles.length) {
    return {
      title: `${fallbackPrefix} Perspective`,
      summary: `No strong ${fallbackPrefix.toLowerCase()} coverage detected for this topic.`,
      sentiment: 'neutral',
      source: 'N/A',
      credibility: 0,
      keyPoints: [],
      articles: [],
    };
  }

  const averageCredibility = Math.round(
    articles.reduce((acc: number, article: any) => acc + (article.credibilityScore ?? 0), 0) /
      articles.length,
  );

  return {
    title: label,
    summary: articles[0]?.summary || `Coverage highlighting ${fallbackPrefix.toLowerCase()} viewpoints.`,
    sentiment: articles[0]?.sentiment || 'neutral',
    source: articles[0]?.source || 'Multiple sources',
    credibility: averageCredibility,
    keyPoints: aggregateKeyPoints(articles).slice(0, 5),
    articles: articles.slice(0, 10).map((article: any) => ({
      id: article._id,
      articleId: article._id,
      title: article.title,
      source: article.source,
      url: article.url,
      credibility: article.credibilityScore,
      summary: article.summary,
      perspective_type:
        article.perspective === 'support'
          ? 'positive'
          : article.perspective === 'oppose'
            ? 'negative'
            : 'neutral',
      credibility_score: article.credibilityScore,
      sentiment: article.sentiment,
      sentiment_score: article.sentimentScore,
      image_url: article.imageUrl,
      published_at: article.publishedAt,
    })),
  };
};

export const compareTopic = asyncHandler(async (req: Request, res: Response) => {
  const { topic, location, forceRefresh } = req.body;

  if (!topic || typeof topic !== 'string') {
    throw new CustomError('Topic is required', 400);
  }

  const analysis = await analyzeTopic(topic, (location as string) || 'global', {
    forceRefresh: Boolean(forceRefresh),
  });

  if (!analysis.articles.length) {
    throw new CustomError('No articles available for comparison', 404);
  }

  const totalArticles = analysis.articles.length || 1;
  const supportCount = analysis.groups.support.length;
  const opposeCount = analysis.groups.oppose.length;
  const distribution = {
    perspective_a_percentage: Math.round((supportCount / totalArticles) * 100),
    perspective_b_percentage: Math.round((opposeCount / totalArticles) * 100),
    neutral_percentage: Math.max(0, Math.round((analysis.groups.neutral.length / totalArticles) * 100)),
  };

  const positivePerspective = mapPerspective(
    analysis.groups.support[0]?.stance || `Supporting ${analysis.topic}`,
    analysis.groups.support,
    'Supporting',
  );

  const negativePerspective = mapPerspective(
    analysis.groups.oppose[0]?.stance || `Critical of ${analysis.topic}`,
    analysis.groups.oppose,
    'Critical',
  );

  const neutralPerspective = mapPerspective(
    analysis.groups.neutral[0]?.stance || `Neutral on ${analysis.topic}`,
    analysis.groups.neutral,
    'Neutral',
  );

  const claims = (analysis.claims as IClaim[]).slice(0, 20).map((claim) => ({
    id: claim._id,
    article_id: claim.articleId,
    claim_text: claim.claimText,
    claim_type: claim.claimType,
    verifiability: claim.verifiability,
    verifiable: claim.verifiability >= 60,
    confidence_score: claim.confidence,
  }));

  const flatArticles = analysis.articles.map((article) => ({
    id: article._id,
    articleId: article._id,
    title: article.title,
    source: article.source,
    url: article.url,
    summary: article.summary,
    description: article.description,
    perspective_type:
      article.perspective === 'support'
        ? 'positive'
        : article.perspective === 'oppose'
          ? 'negative'
          : 'neutral',
    credibility_score: article.credibilityScore,
    bias_score: article.biasScore,
    sentiment: article.sentiment,
    sentiment_score: article.sentimentScore,
    key_points: article.keyPoints,
    published_at: article.publishedAt,
    image_url: article.imageUrl,
  }));

  res.json({
    topic: analysis.topic,
    location: analysis.location,
    refreshed: analysis.refreshed,
    updatedAt: analysis.lastUpdated,
    dividingCriteria: {
      axis_name: `Coverage Spectrum for ${analysis.topic}`,
      perspective_a_label: positivePerspective.title,
      perspective_b_label: negativePerspective.title,
    },
    positive: positivePerspective,
    negative: negativePerspective,
    neutral: neutralPerspective,
    distribution,
    articles: flatArticles,
    claims,
  });
});
