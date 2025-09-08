import mongoose, { Schema, Document } from 'mongoose';
const ClubSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    members: [{ type: String }],
    createdBy: { type: String, required: true },
    allowedYears: [{ type: String }],
    whatsappGroupLink: { type: String },
    presidentName: { type: String },
    contactNo: { type: String },
    photoUrl: { type: String, default: null }
});
export default mongoose.model('Club', ClubSchema);
//# sourceMappingURL=Club.js.map