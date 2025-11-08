import mongoose, { Schema, Document } from 'mongoose';

export interface IDebateModeration extends Document {
  roomId: mongoose.Types.ObjectId;
  participantId: mongoose.Types.ObjectId;
  userId: string;
  action: 'warning' | 'mute' | 'kick' | 'flag';
  reason: string;
  violationType: 'hate_speech' | 'personal_attack' | 'off_topic' | 'spam' | 'inappropriate';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  message?: string;
  createdAt: Date;
}

const DebateModerationSchema: Schema = new Schema(
  {
    roomId: { 
      type: Schema.Types.ObjectId, 
      ref: 'DebateRoom', 
      required: true,
      index: true
    },
    participantId: { 
      type: Schema.Types.ObjectId, 
      ref: 'DebateParticipant',
      index: true
    },
    userId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ['warning', 'mute', 'kick', 'flag'],
      required: true,
    },
    reason: { type: String, required: true },
    violationType: {
      type: String,
      enum: ['hate_speech', 'personal_attack', 'off_topic', 'spam', 'inappropriate'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true,
    },
    confidence: { type: Number, min: 0, max: 100, required: true },
    message: { type: String },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDebateModeration>('DebateModeration', DebateModerationSchema);
