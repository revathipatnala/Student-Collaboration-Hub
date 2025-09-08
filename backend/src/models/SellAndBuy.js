import mongoose, { Schema, Document } from 'mongoose';
const SellAndBuySchema = new Schema({
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    contactInfo: { type: String, required: true },
    createdBy: { type: String, required: true },
    photoUrl: { type: String, default: null }
}, { timestamps: true });
export default mongoose.model('SellAndBuy', SellAndBuySchema);
//# sourceMappingURL=SellAndBuy.js.map