import mongoose, { Document } from 'mongoose';
export interface IClub extends Document {
    name: string;
    description: string;
    members: string[];
    createdBy: string;
    allowedYears: string[];
    whatsappGroupLink?: string;
    presidentName?: string;
    contactNo?: string;
    photoUrl?: string;
}
declare const _default: mongoose.Model<IClub, {}, {}, {}, mongoose.Document<unknown, {}, IClub, {}, {}> & IClub & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Club.d.ts.map