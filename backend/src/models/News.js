import mongoose, { Schema, Document } from 'mongoose';
const NewsSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    date: { type: Date, required: true },
    author: { type: String, required: true }
});
export default mongoose.model('News', NewsSchema);
//# sourceMappingURL=News.js.map