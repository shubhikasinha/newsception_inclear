import mongoose, { Schema, Document } from 'mongoose';

export interface IDebateRequest extends Document {
  topic: string;
  articleId?: mongoose.Types.ObjectId;
  userId: string;
  side?: 'A' | 'B';
  status: 'pending' | 'room_created' | 'completed';
  roomId?: mongoose.Types.ObjectId;
  votes: number;
  voters: string[];
  createdAt: Date;
}

const DebateRequestSchema: Schema = new Schema(
  {
    topic: { type: String, required: true, index: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' },
    userId: { type: String, required: true },
    side: {
      type: String,
      enum: ['A', 'B'],
    },
    status: {
      type: String,
      enum: ['pending', 'room_created', 'completed'],
      default: 'pending',
      index: true,
    },
    roomId: { type: Schema.Types.ObjectId, ref: 'DebateRoom' },
    votes: { type: Number, default: 1 },
    voters: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Compound index for topic-status queries
DebateRequestSchema.index({ topic: 1, status: 1 });

export default mongoose.model<IDebateRequest>('DebateRequest', DebateRequestSchema);
