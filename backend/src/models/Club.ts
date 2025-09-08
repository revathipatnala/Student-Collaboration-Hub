import mongoose, { Schema, Document } from 'mongoose';

export interface IClub extends Document {
  name: string;
  description: string;
  members: string[];
  createdBy: string;
  allowedYears: string[];
  whatsappGroupLink?: string;
  presidentName?: string;
  contactNo?: string;
  photoUrl?: string;
  likes: string[];
  comments: Array<{
    text: string;
    userId: string;
    userName: string;
    createdAt: Date;
    _id?: string;
  }>;
}

const ClubSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  members: [{ type: String }],
  createdBy: { type: String, required: true },
  allowedYears: [{ type: String }],
  whatsappGroupLink: { type: String },
  presidentName: { type: String },
  contactNo: { type: String },
  photoUrl: { type: String, default: null },
  likes: {
    type: [String],
    default: []
  },
  comments: [
    new Schema({
      text: { type: String, required: true },
      userId: { type: String, required: true },
      userName: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }, { _id: true })
  ]
});

export default mongoose.model<IClub>('Club', ClubSchema);
