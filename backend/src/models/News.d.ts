import mongoose, { Document } from 'mongoose';
export interface INews extends Document {
    title: string;
    content: string;
    date: Date;
    author: string;
}
declare const _default: mongoose.Model<INews, {}, {}, {}, mongoose.Document<unknown, {}, INews, {}, {}> & INews & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=News.d.ts.map