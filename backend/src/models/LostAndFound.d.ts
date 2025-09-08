import mongoose, { Document } from 'mongoose';
export interface ILostAndFound extends Document {
    itemName: string;
    description: string;
    dateLost: Date;
    location: string;
    found: boolean;
    contactInfo: string;
    createdBy: string;
    photoUrl?: string;
}
declare const _default: mongoose.Model<ILostAndFound, {}, {}, {}, mongoose.Document<unknown, {}, ILostAndFound, {}, {}> & ILostAndFound & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=LostAndFound.d.ts.map