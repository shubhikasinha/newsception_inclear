import mongoose, { Schema, Document } from 'mongoose';

export interface IDebateParticipant extends Document {
  roomId: mongoose.Types.ObjectId;
  userId: string;
  side: 'A' | 'B';
  speakingTime: number;
  warningCount: number;
  muteCount: number;
  joinedAt: Date;
  leftAt?: Date;
  active: boolean;
}

const DebateParticipantSchema: Schema = new Schema(
  {
    roomId: { 
      type: Schema.Types.ObjectId, 
      ref: 'DebateRoom', 
      required: true,
      index: true
    },
    userId: { type: String, required: true, index: true },
    side: {
      type: String,
      enum: ['A', 'B'],
      required: true,
    },
    speakingTime: { type: Number, default: 0 },
    warningCount: { type: Number, default: 0 },
    muteCount: { type: Number, default: 0 },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    active: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for room-user queries
DebateParticipantSchema.index({ roomId: 1, userId: 1 });

export default mongoose.model<IDebateParticipant>('DebateParticipant', DebateParticipantSchema);
