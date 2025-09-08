import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  branch: string;
  photoUrl?: string;
  createdBy: string;
  registrationLink?: string;
  contactNo?: string;
  coordinatorName1?: string;
  coordinatorName2?: string;
}
export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  location: string;
  branch: string;
  photoUrl?: string;
  createdBy: string;
  registrationLink?: string;
  contactNo?: string;
  coordinatorName1?: string;
  coordinatorName2?: string;
}

const EventSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  branch: { type: String, required: true },
  photoUrl: { type: String },
  createdBy: { type: String, required: true },
  registrationLink: { type: String },
  contactNo: { type: String },
  coordinatorName1: { type: String },
  coordinatorName2: { type: String },
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

export default mongoose.model<IEvent>('Event', EventSchema);
