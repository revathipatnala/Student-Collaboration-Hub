import News from '../models/News.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import fs from 'fs';
export const createNews = async (req, res) => {
    try {
        let photoUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.path, 'news');
            photoUrl = result.secure_url;
            fs.unlinkSync(req.file.path);
        }
        const news = new News({
            ...req.body,
            photoUrl,
        });
        await news.save();
        res.status(201).json(news);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create news' });
    }
};
export const getNews = async (req, res) => {
    try {
        const newsList = await News.find();
        res.json(newsList);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
};
export const updateNews = async (req, res) => {
    try {
        const news = await News.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(news);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update news' });
    }
};
export const deleteNews = async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'News deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete news' });
    }
};
//# sourceMappingURL=newsController.js.map