import mongoose, { Schema, Document } from 'mongoose';

export interface IFactCheck extends Document {
  claimId: mongoose.Types.ObjectId;
  userId?: string;
  vote: 'accurate' | 'misleading' | 'false' | 'unverified';
  evidence: string;
  sources: string[];
  credibilityPoints: number;
  upvotes: number;
  downvotes: number;
  verified: boolean;
  verifiedBy?: string;
  createdAt: Date;
}

const FactCheckSchema: Schema = new Schema(
  {
    claimId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Claim', 
      required: true,
      index: true
    },
    userId: { type: String, index: true },
    vote: {
      type: String,
      enum: ['accurate', 'misleading', 'false', 'unverified'],
      required: true,
    },
    evidence: { type: String, required: true },
    sources: [{ type: String }],
    credibilityPoints: { type: Number, default: 20 },
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    verifiedBy: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFactCheck>('FactCheck', FactCheckSchema);
