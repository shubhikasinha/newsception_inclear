import { Router } from 'express';
import {
  getUserSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscriptionController';
import { optionalAuth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/subscriptions
 * @desc    Get user subscriptions
 * @access  Private (optional for anonymous)
 */
router.get('/', optionalAuth, getUserSubscriptions);

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Private (optional for anonymous)
 */
router.post('/', optionalAuth, createSubscription);

/**
 * @route   PUT /api/subscriptions/:id
 * @desc    Update a subscription
 * @access  Private
 */
router.put('/:id', optionalAuth, updateSubscription);

/**
 * @route   DELETE /api/subscriptions/:id
 * @desc    Deactivate a subscription
 * @access  Private
 */
router.delete('/:id', optionalAuth, deleteSubscription);

export default router;
