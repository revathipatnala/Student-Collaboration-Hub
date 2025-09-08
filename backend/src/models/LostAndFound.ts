import mongoose, { Schema, Document } from 'mongoose';

export interface ILostAndFound extends Document {
  itemName: string;
  description: string;
  dateLost: Date;
  location: string;
  found: boolean;
  contactInfo: string;
  createdBy: string;
  photoUrl?: string;
  comments?: Array<{
    text: string;
    userId: string;
    userName: string;
    createdAt: Date;
  }>;
}

const LostAndFoundSchema: Schema = new Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  dateLost: { type: Date, required: true },
  location: { type: String, required: true },
  found: { type: Boolean, default: false },
  contactInfo: { type: String, required: true },
  createdBy: { type: String, required: true },
  photoUrl: { type: String, default: null },
  comments: [{
    text: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }]
});

export default mongoose.model<ILostAndFound>('LostAndFound', LostAndFoundSchema);
