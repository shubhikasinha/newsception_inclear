import { Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import mlService from '../services/mlService';
import HistoricalContext from '../models/HistoricalContext';
import FactCheck from '../models/FactCheck';
import Claim from '../models/Claim';

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
