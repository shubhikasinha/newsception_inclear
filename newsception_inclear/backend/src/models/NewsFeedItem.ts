import mongoose, { Schema, Document } from 'mongoose';

export interface INewsFeedItem extends Document {
  topic: string;
  headline: string;
  summary: string;
  perspectiveCount: number;
  perspectives: string[];
  sourceCount: number;
  trendingScore: number;
  category: string;
  location?: string;
  imageUrl?: string;
  publishedAt: Date;
  createdAt: Date;
}

const NewsFeedItemSchema: Schema = new Schema(
  {
    topic: { type: String, required: true, index: true },
    headline: { type: String, required: true },
    summary: { type: String, required: true },
    perspectiveCount: { type: Number, default: 2 },
    perspectives: [{ type: String }],
    sourceCount: { type: Number, default: 0 },
    trendingScore: { type: Number, default: 0, index: true },
    category: { type: String, required: true, index: true },
    location: { type: String, index: true },
    imageUrl: { type: String },
    publishedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for feed queries
NewsFeedItemSchema.index({ location: 1, trendingScore: -1 });
NewsFeedItemSchema.index({ category: 1, createdAt: -1 });

export default mongoose.model<INewsFeedItem>('NewsFeedItem', NewsFeedItemSchema);
