import mongoose, { Schema, Document } from 'mongoose';

export interface ISentimentAnalysis extends Document {
  articleId: mongoose.Types.ObjectId;
  topic: string;
  overallSentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  sentimentScore: number;
  confidence: number;
  entities: Array<{
    name: string;
    type: string;
    sentiment: string;
    score: number;
  }>;
  emotionalTones: Array<{
    emotion: string;
    score: number;
  }>;
  keyTopics: string[];
  createdAt: Date;
}

const SentimentAnalysisSchema: Schema = new Schema(
  {
    articleId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Article', 
      required: true,
      index: true
    },
    topic: { type: String, required: true, index: true },
    overallSentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral', 'mixed'],
      required: true,
    },
    sentimentScore: { type: Number, min: -1, max: 1, required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
    entities: [{
      name: { type: String, required: true },
      type: { type: String, required: true },
      sentiment: { type: String, required: true },
      score: { type: Number, min: -1, max: 1 },
    }],
    emotionalTones: [{
      emotion: { type: String, required: true },
      score: { type: Number, min: 0, max: 1 },
    }],
    keyTopics: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISentimentAnalysis>('SentimentAnalysis', SentimentAnalysisSchema);
