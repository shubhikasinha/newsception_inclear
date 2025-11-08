import mongoose, { Schema, Document } from 'mongoose';

export interface ILocationTrending extends Document {
  location: string;
  topics: Array<{
    topic: string;
    count: number;
    lastSeen: Date;
  }>;
  updatedAt: Date;
}

const LocationTrendingSchema: Schema = new Schema(
  {
    location: { type: String, required: true, unique: true, index: true },
    topics: [{
      topic: { type: String, required: true },
      count: { type: Number, default: 1 },
      lastSeen: { type: Date, default: Date.now },
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ILocationTrending>('LocationTrending', LocationTrendingSchema);
