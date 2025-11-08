import { Request, Response } from 'express';
import { asyncHandler, CustomError } from '../middleware/errorHandler';
import Subscription from '../models/Subscription';
import { getUserId } from '../middleware/auth';

export const getUserSubscriptions = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);

  const subscriptions = await Subscription.find({ userId, active: true });

  res.json({
    subscriptions,
    count: subscriptions.length,
  });
});

export const createSubscription = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const { type, topics, deliveryFrequency, format } = req.body;

  if (!type) {
    throw new CustomError('Subscription type is required', 400);
  }

  const subscription = await Subscription.create({
    userId,
    type,
    topics: topics || [],
    deliveryFrequency: deliveryFrequency || 'daily',
    format: format || 'brief',
    active: true,
  });

  res.status(201).json({
    success: true,
    subscription,
    message: 'Subscription created successfully',
  });
});

export const updateSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getUserId(req);
  const updates = req.body;

  const subscription = await Subscription.findOneAndUpdate(
    { _id: id, userId },
    { $set: updates },
    { new: true }
  );

  if (!subscription) {
    throw new CustomError('Subscription not found', 404);
  }

  res.json({
    success: true,
    subscription,
    message: 'Subscription updated successfully',
  });
});

export const deleteSubscription = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = getUserId(req);

  const subscription = await Subscription.findOneAndUpdate(
    { _id: id, userId },
    { active: false },
    { new: true }
  );

  if (!subscription) {
    throw new CustomError('Subscription not found', 404);
  }

  res.json({
    success: true,
    message: 'Subscription deactivated successfully',
  });
});
