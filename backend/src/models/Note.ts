import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  title: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  photoUrl?: string | null;
  createdAt: Date;
  updatedAt: Date;
  likes: mongoose.Types.ObjectId[];
  comments: {
    _id: any;
    text: string;
    userId: mongoose.Types.ObjectId;
    userName: string;
    createdAt: Date;
  }[];
}

const noteSchema = new Schema<INote>({
  title: {
    type: String,
    required: [true, 'Note title is required'],
    trim: true,
    maxlength: [100, 'Title must be less than 100 characters']
  },
  content: {
    type: String,
    required: [true, 'Note content is required'],
    maxlength: [5000, 'Content must be less than 5000 characters']
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photoUrl: {
    type: String,
    default: null
  },
  likes: {
    type: [Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  comments: [
    new Schema({
      text: { type: String, required: true },
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      userName: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }, { _id: true })
  ]
}, 
{
  timestamps: true
});

noteSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<INote>('Note', noteSchema);