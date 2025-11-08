import { Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import Article from '../models/Article';
import SentimentAnalysis from '../models/SentimentAnalysis';
import BiasAnalysis from '../models/BiasAnalysis';
import Claim from '../models/Claim';
import ClaimVerification from '../models/ClaimVerification';
import NewsFeedItem from '../models/NewsFeedItem';

export const getArticleById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const article = await Article.findById(id);
  if (!article) {
    throw new CustomError('Article not found', 404);
  }

  // Get related analysis
  const sentiment = await SentimentAnalysis.findOne({ articleId: id });
  const bias = await BiasAnalysis.findOne({ articleId: id });
  const claims = await Claim.find({ articleId: id });

  // Get claim verifications
  const claimVerifications = await Promise.all(
    claims.map(claim => ClaimVerification.findOne({ claimId: claim._id }))
  );

  res.json({
    article,
    analysis: {
      sentiment,
      bias,
      claims: claims.map((claim, i) => ({
        ...claim.toObject(),
        verification: claimVerifications[i],
      })),
    },
  });
});

export const getNewsFeed = asyncHandler(async (req: Request, res: Response) => {
  const { page = 1, limit = 5, location, category } = req.query;

  const query: any = {};
  if (location) query.location = location;
  if (category) query.category = category;

  const skip = (Number(page) - 1) * Number(limit);

  const feed = await NewsFeedItem.find(query)
    .sort({ trendingScore: -1, createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  const total = await NewsFeedItem.countDocuments(query);

  res.json({
    feed,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total,
      pages: Math.ceil(total / Number(limit)),
    },
  });
});

export const generateNewsFeed = asyncHandler(async (req: Request, res: Response) => {
  const { location } = req.query;

  // Get recent trending topics
  const topics = await Article.aggregate([
    ...(location ? [{ $match: { location } }] : []),
    {
      $group: {
        _id: '$topic',
        count: { $sum: 1 },
        latestArticle: { $first: '$$ROOT' },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  // Create feed items
  const feedItems = await Promise.all(
    topics.map(async (topicGroup) => {
      const topic = topicGroup._id;
      const articles = await Article.find({ topic }).limit(5);
      
      const perspectives = [...new Set(articles.map(a => a.stance))];
      
      return NewsFeedItem.findOneAndUpdate(
        { topic },
        {
          topic,
          headline: topicGroup.latestArticle.title,
          summary: topicGroup.latestArticle.summary,
          perspectiveCount: perspectives.length,
          perspectives,
          sourceCount: articles.length,
          trendingScore: topicGroup.count,
          category: topicGroup.latestArticle.category || 'General',
          location: location as string || 'global',
          imageUrl: topicGroup.latestArticle.imageUrl,
          publishedAt: topicGroup.latestArticle.publishedAt,
        },
        { upsert: true, new: true }
      );
    })
  );

  res.json({ feed: feedItems, count: feedItems.length });
});
