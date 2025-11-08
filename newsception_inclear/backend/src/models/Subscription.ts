import mongoose, { Schema, Document } from 'mongoose';

export interface ISubscription extends Document {
  userId: string;
  type: 'upsc' | 'business' | 'technology' | 'policy' | 'science' | 'custom';
  topics: string[];
  deliveryFrequency: 'daily' | 'weekly' | 'real_time';
  format: 'brief' | 'detailed' | 'exam_focused';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['upsc', 'business', 'technology', 'policy', 'science', 'custom'],
      required: true,
    },
    topics: [{ type: String }],
    deliveryFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'real_time'],
      default: 'daily',
    },
    format: {
      type: String,
      enum: ['brief', 'detailed', 'exam_focused'],
      default: 'brief',
    },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for user-type queries
SubscriptionSchema.index({ userId: 1, type: 1 });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
