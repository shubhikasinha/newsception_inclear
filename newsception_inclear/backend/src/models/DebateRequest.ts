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
      votes: { type: Number, default: 0 },
      voters: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

// Compound index for topic-status queries
DebateRequestSchema.index({ topic: 1, status: 1 });

// Ensure votes count always matches voters array length before saving.
DebateRequestSchema.pre<IDebateRequest>('save', function (next) {
  try {
    const len = Array.isArray(this.voters) ? this.voters.length : 0;
    if (this.votes !== len) {
      // Correct inconsistency rather than throwing so existing documents auto-fix.
      this.votes = len;
    }
    next();
  } catch (err) {
    next(err as any);
  }
});

// Static helper to add a vote atomically using an aggregation-style update pipeline.
// Returns the updated document.
DebateRequestSchema.statics.addVote = async function (
  id: mongoose.Types.ObjectId | string,
  userId: string
) {
  // Use update with aggregation pipeline to add to set only if not present, then set votes to size(voters)
  // This runs atomically on the server.
  const updated = await this.findByIdAndUpdate(
    id,
    [
      {
        $set: {
          voters: {
            $cond: [
              { $in: [userId, '$voters'] },
              '$voters',
              { $concatArrays: ['$voters', [userId]] },
            ],
          },
        },
      },
      { $set: { votes: { $size: '$voters' } } },
    ],
    { new: true }
  ).exec();

  return updated;
};

// Static helper to remove a vote atomically and sync votes count.
DebateRequestSchema.statics.removeVote = async function (
  id: mongoose.Types.ObjectId | string,
  userId: string
) {
  const updated = await this.findByIdAndUpdate(
    id,
    [
      {
        $set: {
          voters: {
            $filter: {
              input: '$voters',
              as: 'v',
              cond: { $ne: ['$$v', userId] },
            },
          },
        },
      },
      { $set: { votes: { $size: '$voters' } } },
    ],
    { new: true }
  ).exec();

  return updated;
};

export default mongoose.model<IDebateRequest>('DebateRequest', DebateRequestSchema);
