import mongoose, { Schema, Document } from 'mongoose';

export interface IDebateRoom extends Document {
  topic: string;
  articleId?: mongoose.Types.ObjectId;
  roomName: string;
  perspectiveA: string;
  perspectiveB: string;
  participantCount: number;
  sideACount: number;
  sideBCount: number;
  status: 'active' | 'ended';
  startedAt: Date;
  endedAt?: Date;
}

const DebateRoomSchema: Schema = new Schema(
  {
    topic: { type: String, required: true, index: true },
    articleId: { type: Schema.Types.ObjectId, ref: 'Article' },
    roomName: { type: String, required: true, unique: true },
    perspectiveA: { type: String, required: true },
    perspectiveB: { type: String, required: true },
    participantCount: { type: Number, default: 0 },
    sideACount: { type: Number, default: 0 },
    sideBCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'ended'],
      default: 'active',
      index: true,
    },
    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDebateRoom>('DebateRoom', DebateRoomSchema);
