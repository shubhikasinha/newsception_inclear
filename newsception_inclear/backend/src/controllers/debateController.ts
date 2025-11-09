import { Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import DebateRequest from '../models/DebateRequest';
import DebateRoom from '../models/DebateRoom';
import DebateParticipant from '../models/DebateParticipant';
import DebateModeration from '../models/DebateModeration';
import livekitService from '../services/livekitService';
import Article from '../models/Article';
import { generateAnonId, generateRoomId, generateSessionId } from '../utils/idGenerator';

const DEBATE_THRESHOLD = 5;

export const requestDebate = asyncHandler(async (req: Request, res: Response) => {
  const { topic, articleId, side } = req.body;
  const userId = req.auth?.sub || generateAnonId();

  if (!topic) {
    throw new CustomError('Topic is required', 400);
  }

  // Check if user already requested for this topic
  const existing = await DebateRequest.findOne({ topic, userId, status: 'pending' });
  if (existing) {
    throw new CustomError('You have already requested a debate for this topic', 400);
  }

  // Create debate request
  const request = await DebateRequest.create({
    topic,
    articleId,
    userId,
    side,
    status: 'pending',
  });

  // Count pending requests for this topic
  const requestCount = await DebateRequest.countDocuments({ topic, status: 'pending' });

  // Check if threshold met
  if (requestCount >= DEBATE_THRESHOLD) {
    // Get article for perspectives
    const supportArticle = await Article.findOne({ topic, perspective: 'support' });
    const opposeArticle = await Article.findOne({ topic, perspective: 'oppose' });

    // Create debate room
    const roomName = generateRoomId(topic);
    const room = await DebateRoom.create({
      topic,
      articleId,
      roomName,
      perspectiveA: supportArticle?.stance || `Supporting ${topic}`,
      perspectiveB: opposeArticle?.stance || `Critical of ${topic}`,
      status: 'active',
    });

    // Update all pending requests
    await DebateRequest.updateMany(
      { topic, status: 'pending' },
      { status: 'room_created', roomId: room._id }
    );

    return res.json({
      success: true,
      message: 'Debate room created!',
      request,
      room,
      requestCount,
    });
  }

  return res.json({
    success: true,
    message: 'Debate request submitted',
    request,
    requestCount,
    threshold: DEBATE_THRESHOLD,
  });
});

export const getDebateRequests = asyncHandler(async (req: Request, res: Response) => {
  const { topic } = req.query;

  if (!topic) {
    throw new CustomError('Topic is required', 400);
  }

  const requests = await DebateRequest.find({ topic });
  const pendingCount = await DebateRequest.countDocuments({ topic, status: 'pending' });
  const room = await DebateRoom.findOne({ topic, status: 'active' });

  res.json({
    requests,
    pendingCount,
    threshold: DEBATE_THRESHOLD,
    room,
  });
});

export const joinDebateRoom = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const { side } = req.body;
  const userId = req.auth?.sub || generateAnonId();

  if (!side || !['A', 'B'].includes(side)) {
    throw new CustomError('Valid side (A or B) is required', 400);
  }

  const room = await DebateRoom.findById(roomId);
  if (!room) {
    throw new CustomError('Debate room not found', 404);
  }

  if (room.status !== 'active') {
    throw new CustomError('Debate room is not active', 400);
  }

  // Check if user already joined
  let participant = await DebateParticipant.findOne({ roomId, userId, active: true });

  if (!participant) {
    // Create new participant
    participant = await DebateParticipant.create({
      roomId,
      userId,
      side,
      active: true,
    });

    // Update room counts
    if (side === 'A') {
      room.sideACount += 1;
    } else {
      room.sideBCount += 1;
    }
    room.participantCount += 1;
    await room.save();
  }

  // Generate LiveKit token if configured
  let token = null;
  if (livekitService.isConfigured()) {
    token = await livekitService.generateToken(room.roomName, userId);
  }

  return res.json({
    success: true,
    room,
    participant,
    token,
    livekitUrl: process.env.LIVEKIT_URL,
    livekitConfigured: livekitService.isConfigured(),
  });
});

export const leaveDebateRoom = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;
  const userId = req.auth?.sub || req.body.userId;

  const participant = await DebateParticipant.findOne({ roomId, userId, active: true });
  
  if (participant) {
    participant.active = false;
    participant.leftAt = new Date();
    await participant.save();

    // Update room counts
    const room = await DebateRoom.findById(roomId);
    if (room) {
      if (participant.side === 'A') {
        room.sideACount = Math.max(0, room.sideACount - 1);
      } else {
        room.sideBCount = Math.max(0, room.sideBCount - 1);
      }
      room.participantCount = Math.max(0, room.participantCount - 1);
      await room.save();
    }
  }

  res.json({ success: true, message: 'Left debate room' });
});

export const getRoomParticipants = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.params;

  const participants = await DebateParticipant.find({ roomId, active: true });
  const room = await DebateRoom.findById(roomId);

  res.json({
    participants,
    room,
    count: participants.length,
  });
});

export const moderateParticipant = asyncHandler(async (req: Request, res: Response) => {
  const { roomId, userId, action, reason, violationType, severity } = req.body;

  if (!roomId || !userId || !action) {
    throw new CustomError('Missing required fields', 400);
  }

  const participant = await DebateParticipant.findOne({ roomId, userId, active: true });
  if (!participant) {
    throw new CustomError('Participant not found', 404);
  }

  // Apply moderation action
  if (action === 'warning') {
    participant.warningCount += 1;
  } else if (action === 'mute') {
    participant.muteCount += 1;
  }
  await participant.save();

  // Log moderation action
  await DebateModeration.create({
    roomId,
    participantId: participant._id,
    userId,
    action,
    reason: reason || 'Automated moderation',
    violationType: violationType || 'inappropriate',
    severity: severity || 'medium',
    confidence: 85,
  });

  res.json({
    success: true,
    message: `${action} applied to participant`,
    participant,
  });
});

export const getModerationLogs = asyncHandler(async (req: Request, res: Response) => {
  const { roomId } = req.query;

  if (!roomId) {
    throw new CustomError('Room ID is required', 400);
  }

  const logs = await DebateModeration.find({ roomId })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({ logs, count: logs.length });
});
