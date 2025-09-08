import LostAndFound from '../models/LostAndFound.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import fs from 'fs';
export const createLostAndFound = async (req, res) => {
    try {
        let photoUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file, 'lostandfound');
            photoUrl = result.secure_url;
        }
        const item = new LostAndFound({
            ...req.body,
            photoUrl,
        });
        await item.save();
        res.status(201).json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create lost and found item' });
    }
};
export const getLostAndFound = async (req, res) => {
    try {
        const items = await LostAndFound.find();
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch lost and found items' });
    }
};
export const updateLostAndFound = async (req, res) => {
    try {
        let photoUrl = req.body.photoUrl;
        if (req.file) {
            const result = await uploadToCloudinary(req.file, 'lostandfound');
            photoUrl = result.secure_url;
        }
        const updateData = { ...req.body };
        if (photoUrl)
            updateData.photoUrl = photoUrl;
        const item = await LostAndFound.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update lost and found item' });
    }
};
export const deleteLostAndFound = async (req, res) => {
    try {
        await LostAndFound.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete lost and found item' });
    }
};
//# sourceMappingURL=lostAndFoundController.js.map