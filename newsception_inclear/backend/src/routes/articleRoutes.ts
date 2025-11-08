import { Router } from 'express';
import { getArticleById, getNewsFeed, generateNewsFeed } from '../controllers/articleController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/articles/:id
 * @desc    Get article by ID with full analysis
 * @access  Public
 */
router.get('/:id', getArticleById);

/**
 * @route   GET /api/articles/feed
 * @desc    Get paginated news feed
 * @access  Public
 * @query   page, limit, location, category
 */
router.get('/feed/items', optionalAuth, getNewsFeed);

/**
 * @route   POST /api/articles/feed/generate
 * @desc    Generate news feed from articles
 * @access  Public
 */
router.post('/feed/generate', generateNewsFeed);

export default router;
