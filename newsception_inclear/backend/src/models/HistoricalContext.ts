import mongoose, { Schema, Document } from 'mongoose';

export interface IHistoricalContext extends Document {
  topic: string;
  events: Array<{
    date: Date;
    headline: string;
    summary: string;
    significance: string;
    sources: string[];
  }>;
  keyDevelopments: string[];
  relatedTopics: string[];
  createdAt: Date;
  expiresAt: Date;
}

const HistoricalContextSchema: Schema = new Schema(
  {
    topic: { type: String, required: true, unique: true, index: true },
    events: [{
      date: { type: Date, required: true },
      headline: { type: String, required: true },
      summary: { type: String, required: true },
      significance: { type: String, required: true },
      sources: [{ type: String }],
    }],
    keyDevelopments: [{ type: String }],
    relatedTopics: [{ type: String }],
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) },
  },
  {
    timestamps: true,
  }
);

// TTL index to auto-delete after 24 hours
HistoricalContextSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IHistoricalContext>('HistoricalContext', HistoricalContextSchema);
