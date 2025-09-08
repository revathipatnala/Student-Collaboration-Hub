import SellAndBuy from '../models/SellAndBuy.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import fs from 'fs';
export const createSellAndBuy = async (req, res) => {
    try {
        let photoUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file, 'sellandbuy');
            photoUrl = result.secure_url;
        }
        const item = new SellAndBuy({
            ...req.body,
            photoUrl,
        });
        await item.save();
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create sell/buy item' });
    }
};
export const getSellAndBuy = async (req, res) => {
    try {
        const items = await SellAndBuy.find().sort({ createdAt: -1 });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch sell/buy items' });
    }
};
export const updateSellAndBuy = async (req, res) => {
    try {
        let photoUrl = req.body.photoUrl;
        if (req.file) {
            const result = await uploadToCloudinary(req.file, 'sellandbuy');
            photoUrl = result.secure_url;
        }
        const updateData = { ...req.body };
        if (photoUrl)
            updateData.photoUrl = photoUrl;
        const item = await SellAndBuy.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update sell/buy item' });
    }
};
export const deleteSellAndBuy = async (req, res) => {
    try {
        await SellAndBuy.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete sell/buy item' });
    }
};
//# sourceMappingURL=sellAndBuyController.js.map