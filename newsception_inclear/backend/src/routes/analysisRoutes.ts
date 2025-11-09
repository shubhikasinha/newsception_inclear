import { Router } from 'express';
import { 
  getHistoricalContext, 
  submitFactCheck, 
  voteFactCheck, 
  getFactChecks, 
  compareTopic,
} from '../controllers/analysisController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/analysis/historical
 * @desc    Get historical context for a topic
 * @access  Public
 * @query   topic (required)
 */
router.get('/historical', getHistoricalContext);

/**
 * @route   POST /api/analysis/factcheck
 * @desc    Submit a fact check for a claim
 * @access  Private (optional for anonymous)
 */
router.post('/factcheck', optionalAuth, submitFactCheck);

/**
 * @route   POST /api/analysis/factcheck/:id/vote
 * @desc    Vote on a fact check
 * @access  Public
 */
router.post('/factcheck/:id/vote', voteFactCheck);

/**
 * @route   GET /api/analysis/factchecks
 * @desc    Get fact checks for a claim
 * @access  Public
 * @query   claimId (required)
 */
router.get('/factchecks', getFactChecks);

/**
 * @route   POST /api/analysis/compare
 * @desc    Build dual-perspective analysis for a topic
 * @access  Public
 * @body    topic (required), location (optional), forceRefresh (optional)
 */
router.post('/compare', compareTopic);

export default router;
