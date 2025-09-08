import mongoose, { Document } from 'mongoose';
export interface ISellAndBuy extends Document {
    itemName: string;
    description: string;
    price: number;
    contactInfo: string;
    createdBy: string;
    createdAt: Date;
    photoUrl?: string;
}
declare const _default: mongoose.Model<ISellAndBuy, {}, {}, {}, mongoose.Document<unknown, {}, ISellAndBuy, {}, {}> & ISellAndBuy & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default _default;
//# sourceMappingURL=SellAndBuy.d.ts.map