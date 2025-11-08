import mongoose, { Schema, Document } from 'mongoose';

export interface IBiasAnalysis extends Document {
  articleId: mongoose.Types.ObjectId;
  topic: string;
  biasScore: number;
  coverageTilt: 'heavily_left' | 'left' | 'center_left' | 'center' | 'center_right' | 'right' | 'heavily_right';
  loadedTerms: Array<{
    term: string;
    context: string;
    biasType: string;
    frequency: number;
  }>;
  reasoning: string;
  confidence: number;
  createdAt: Date;
}

const BiasAnalysisSchema: Schema = new Schema(
  {
    articleId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Article', 
      required: true,
      index: true
    },
    topic: { type: String, required: true, index: true },
    biasScore: { type: Number, min: -100, max: 100, required: true },
    coverageTilt: {
      type: String,
      enum: ['heavily_left', 'left', 'center_left', 'center', 'center_right', 'right', 'heavily_right'],
      required: true,
    },
    loadedTerms: [{
      term: { type: String, required: true },
      context: { type: String, required: true },
      biasType: { type: String, required: true },
      frequency: { type: Number, default: 1 },
    }],
    reasoning: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBiasAnalysis>('BiasAnalysis', BiasAnalysisSchema);
