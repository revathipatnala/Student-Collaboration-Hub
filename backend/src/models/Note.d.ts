import mongoose, { Document } from 'mongoose';
export interface INote extends Document {
    title: string;
    content: string;
    userId: mongoose.Types.ObjectId;
    photoUrl?: string | null;
    createdAt: Date;
    updatedAt: Date;
    likes: mongoose.Types.ObjectId[];
    comments: {
        text: string;
        userId: mongoose.Types.ObjectId;
        userName: string;
        createdAt: Date;
    }[];
}
declare const _default: mongoose.Model<INote, {}, {}, {}, mongoose.Document<unknown, {}, INote, {}, {}> & INote & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Note.d.ts.map