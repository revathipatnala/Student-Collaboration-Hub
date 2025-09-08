import mongoose, { Schema, Document } from 'mongoose';
const EventSchema = new Schema({
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
    coordinatorName2: { type: String }
});
export default mongoose.model('Event', EventSchema);
//# sourceMappingURL=Event.js.map