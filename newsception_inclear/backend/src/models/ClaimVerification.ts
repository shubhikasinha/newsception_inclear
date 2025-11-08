import mongoose, { Schema, Document } from 'mongoose';

export interface IClaimVerification extends Document {
  claimId: mongoose.Types.ObjectId;
  topic: string;
  accuracyScore: number;
  verdict: 'verified' | 'misleading' | 'false' | 'unverified';
  evidence: Array<{
    source: string;
    url: string;
    snippet: string;
    credibility: number;
  }>;
  reasoning: string;
  confidence: number;
  checkedAt: Date;
}

const ClaimVerificationSchema: Schema = new Schema(
  {
    claimId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Claim', 
      required: true,
      index: true
    },
    topic: { type: String, required: true, index: true },
    accuracyScore: { type: Number, min: 0, max: 100, required: true },
    verdict: {
      type: String,
      enum: ['verified', 'misleading', 'false', 'unverified'],
      required: true,
    },
    evidence: [{
      source: { type: String, required: true },
      url: { type: String, required: true },
      snippet: { type: String, required: true },
      credibility: { type: Number, min: 0, max: 100 },
    }],
    reasoning: { type: String, required: true },
    confidence: { type: Number, min: 0, max: 100, required: true },
    checkedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IClaimVerification>('ClaimVerification', ClaimVerificationSchema);
