import { Router } from 'express';
import {
  requestDebate,
  getDebateRequests,
  joinDebateRoom,
  leaveDebateRoom,
  getRoomParticipants,
  moderateParticipant,
  getModerationLogs,
} from '../controllers/debateController';
import { optionalAuth } from '../middleware/auth';
import { debateRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * @route   POST /api/debate/request
 * @desc    Request a debate for a topic
 * @access  Public (optional auth)
 */
router.post('/request', optionalAuth, debateRateLimiter, requestDebate);

/**
 * @route   GET /api/debate/requests
 * @desc    Get debate requests for a topic
 * @access  Public
 * @query   topic (required)
 */
router.get('/requests', getDebateRequests);

/**
 * @route   POST /api/debate/room/:roomId/join
 * @desc    Join a debate room
 * @access  Public (optional auth)
 */
router.post('/room/:roomId/join', optionalAuth, joinDebateRoom);

/**
 * @route   POST /api/debate/room/:roomId/leave
 * @desc    Leave a debate room
 * @access  Public
 */
router.post('/room/:roomId/leave', optionalAuth, leaveDebateRoom);

/**
 * @route   GET /api/debate/room/:roomId/participants
 * @desc    Get participants in a debate room
 * @access  Public
 */
router.get('/room/:roomId/participants', getRoomParticipants);

/**
 * @route   POST /api/debate/moderate
 * @desc    Apply moderation action to a participant
 * @access  Public (should be admin in production)
 */
router.post('/moderate', moderateParticipant);

/**
 * @route   GET /api/debate/moderation/logs
 * @desc    Get moderation logs for a room
 * @access  Public
 * @query   roomId (required)
 */
router.get('/moderation/logs', getModerationLogs);

export default router;
