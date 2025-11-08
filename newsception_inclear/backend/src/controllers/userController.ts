import { Request, Response } from 'express';
import { asyncHandler } from '../middleware/errorHandler';
import UserPreferences from '../models/UserPreferences';
import { getUserId } from '../middleware/auth';

export const getUserPreferences = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);

  let preferences = await UserPreferences.findOne({ userId });

  if (!preferences) {
    // Create default preferences
    preferences = await UserPreferences.create({
      userId,
      preferredTopics: [],
      preferredSources: [],
      darkMode: false,
      notificationsEnabled: true,
    });
  }

  res.json(preferences);
});

export const updateUserPreferences = asyncHandler(async (req: Request, res: Response) => {
  const userId = getUserId(req);
  const updates = req.body;

  const preferences = await UserPreferences.findOneAndUpdate(
    { userId },
    { $set: updates },
    { new: true, upsert: true }
  );

  res.json({
    success: true,
    preferences,
    message: 'Preferences updated successfully',
  });
});
