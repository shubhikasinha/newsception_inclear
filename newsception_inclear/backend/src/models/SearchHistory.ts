import mongoose, { Schema, Document } from 'mongoose';

export interface ISearchHistory extends Document {
  topic: string;
  searchCount: number;
  lastSearchedAt: Date;
  locations: string[];
}

const SearchHistorySchema: Schema = new Schema(
  {
    topic: { type: String, required: true, unique: true, index: true },
    searchCount: { type: Number, default: 1 },
    lastSearchedAt: { type: Date, default: Date.now, index: true },
    locations: [{ type: String }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISearchHistory>('SearchHistory', SearchHistorySchema);
