import mongoose, { Schema, Document } from 'mongoose';

export interface IClaim extends Document {
  articleId: mongoose.Types.ObjectId;
  topic: string;
  claimText: string;
  claimType: 'factual' | 'opinion' | 'prediction' | 'statistic';
  verifiability: number;
  confidence: number;
  createdAt: Date;
}

const ClaimSchema: Schema = new Schema(
  {
    articleId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Article', 
      required: true,
      index: true
    },
    topic: { type: String, required: true, index: true },
    claimText: { type: String, required: true },
    claimType: {
      type: String,
      enum: ['factual', 'opinion', 'prediction', 'statistic'],
      required: true,
    },
    verifiability: { type: Number, min: 0, max: 100, required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClaim>('Claim', ClaimSchema);
