import mongoose, { Schema, Document } from 'mongoose';

export interface ISellAndBuy extends Document {
  itemName: string;
  description: string;
  price: number;
  contactInfo: string;
  createdBy: string;
  createdAt: Date;
  photoUrl?: string;
}

const SellAndBuySchema: Schema = new Schema({
  itemName: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  contactInfo: { type: String, required: true },
  createdBy: { type: String, required: true },
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
}, { timestamps: true });

export default mongoose.model<ISellAndBuy>('SellAndBuy', SellAndBuySchema);
