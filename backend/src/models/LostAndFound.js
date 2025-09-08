import mongoose, { Schema, Document } from 'mongoose';
const LostAndFoundSchema = new Schema({
    itemName: { type: String, required: true },
    description: { type: String, required: true },
    dateLost: { type: Date, required: true },
    location: { type: String, required: true },
    found: { type: Boolean, default: false },
    contactInfo: { type: String, required: true },
    createdBy: { type: String, required: true },
    photoUrl: { type: String, default: null }
});
export default mongoose.model('LostAndFound', LostAndFoundSchema);
//# sourceMappingURL=LostAndFound.js.map