import mongoose, { Document } from 'mongoose';
export interface IEvent extends Document {
    title: string;
    description: string;
    date: Date;
    location: string;
    branch: string;
    photoUrl?: string;
    createdBy: string;
    registrationLink?: string;
    contactNo?: string;
    coordinatorName1?: string;
    coordinatorName2?: string;
}
export interface IEvent extends Document {
    title: string;
    description: string;
    date: Date;
    location: string;
    branch: string;
    photoUrl?: string;
    createdBy: string;
    registrationLink?: string;
    contactNo?: string;
    coordinatorName1?: string;
    coordinatorName2?: string;
}
declare const _default: mongoose.Model<IEvent, {}, {}, {}, mongoose.Document<unknown, {}, IEvent, {}, {}> & IEvent & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=Event.d.ts.map