import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: string;
  email?: string;
  preferredTopics: string[];
  preferredSources: string[];
  location?: string;
  darkMode: boolean;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    preferredTopics: [{ type: String }],
    preferredSources: [{ type: String }],
    location: { type: String },
    darkMode: { type: Boolean, default: false },
    notificationsEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
