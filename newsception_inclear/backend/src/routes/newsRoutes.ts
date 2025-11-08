import { Router } from 'express';
import { searchNews, getTrendingTopics } from '../controllers/newsController';
import { searchRateLimiter } from '../middleware/rateLimiter';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/news/search
 * @desc    Search and analyze news by topic
 * @access  Public
 * @query   topic (required), location (optional)
 */
router.get('/search', optionalAuth, searchRateLimiter, searchNews);

/**
 * @route   GET /api/news/trending
 * @desc    Get trending topics
 * @access  Public
 * @query   location (optional)
 */
router.get('/trending', getTrendingTopics);

export default router;
