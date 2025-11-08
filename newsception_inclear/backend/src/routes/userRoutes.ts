import { Router } from 'express';
import { getUserPreferences, updateUserPreferences } from '../controllers/userController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/user/preferences
 * @desc    Get user preferences
 * @access  Private (optional for anonymous)
 */
router.get('/preferences', optionalAuth, getUserPreferences);

/**
 * @route   PUT /api/user/preferences
 * @desc    Update user preferences
 * @access  Private (optional for anonymous)
 */
router.put('/preferences', optionalAuth, updateUserPreferences);

export default router;
