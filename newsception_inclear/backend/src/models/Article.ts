import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  topic: string;
  title: string;
  url: string;
  source: string;
  description: string;
  publishedAt: Date;
  perspective: 'support' | 'oppose' | 'neutral';
  stance: string;
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;
  summary: string;
  keyPoints: string[];
  credibilityScore: number;
  biasScore: number;
  imageUrl?: string;
  author?: string;
  category?: string;
  location?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema: Schema = new Schema(
  {
    topic: { type: String, required: true, index: true },
    title: { type: String, required: true },
    url: { type: String, required: true, unique: true },
    source: { type: String, required: true, index: true },
    description: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    perspective: { 
      type: String, 
      enum: ['support', 'oppose', 'neutral'], 
      required: true,
      index: true
    },
    stance: { type: String, required: true },
    sentiment: { 
      type: String, 
      enum: ['positive', 'negative', 'neutral', 'mixed'], 
      required: true 
    },
    sentimentScore: { type: Number, min: -1, max: 1, default: 0 },
    summary: { type: String, required: true },
    keyPoints: [{ type: String }],
    credibilityScore: { type: Number, min: 0, max: 100, default: 50 },
    biasScore: { type: Number, min: -100, max: 100, default: 0 },
    imageUrl: { type: String },
    author: { type: String },
    category: { type: String, index: true },
    location: { type: String, index: true },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
ArticleSchema.index({ topic: 1, perspective: 1 });
ArticleSchema.index({ createdAt: -1 });
ArticleSchema.index({ location: 1, createdAt: -1 });

export default mongoose.model<IArticle>('Article', ArticleSchema);
