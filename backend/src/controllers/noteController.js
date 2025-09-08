export const addComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { text } = req.body;
        const userId = req.user._id;
        const userName = req.user.fullName;
        if (!text || !userId || !userName) {
            res.status(400).json({ error: 'Missing comment text or user info' });
            return;
        }
        const note = await Note.findById(id);
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        note.comments.push({ text, userId, userName, createdAt: new Date() });
        await note.save();
        res.status(200).json({ message: 'Comment added', comments: note.comments });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add comment' });
    }
};
import mongoose from 'mongoose';
import Note from '../models/Note.js';
export const likeNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const note = await Note.findById(id);
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        if (note.likes.includes(userId)) {
            // If already liked, unlike (remove userId)
            note.likes = note.likes.filter((uid) => uid.toString() !== userId.toString());
            await note.save();
            res.status(200).json({ message: 'Note unliked', likes: note.likes.length });
        }
        else {
            // If not liked, like (add userId)
            note.likes.push(userId);
            await note.save();
            res.status(200).json({ message: 'Note liked', likes: note.likes.length });
        }
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to like note' });
    }
};
export const unlikeNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const note = await Note.findById(id);
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        note.likes = note.likes.filter((uid) => uid.toString() !== userId.toString());
        await note.save();
        res.status(200).json({ message: 'Note unliked', likes: note.likes.length });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to unlike note' });
    }
};
// ...existing code...
export const createNote = async (req, res) => {
    try {
        const { title, content } = req.body;
        const userId = req.user._id;
        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }
        let photoUrl = undefined;
        if (req.file) {
            // Dynamically import uploadToCloudinary
            const uploadToCloudinary = (await import('../utils/uploadToCloudinary.js')).default;
            const result = await uploadToCloudinary(req.file, 'notes');
            photoUrl = result.secure_url;
        }
        const note = new Note({
            title,
            content,
            userId,
            ...(photoUrl && { photoUrl })
        });
        await note.save();
        res.status(201).json({
            message: 'Note created successfully',
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                photoUrl: note.photoUrl,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                createdBy: note.userId,
                likes: note.likes || [],
                comments: note.comments || [],
            }
        });
    }
    catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
};
export const getNotes = async (req, res) => {
    try {
        // Populate userId to get fullName
        const notes = await Note.find().sort({ createdAt: -1 }).populate('userId', 'fullName');
        res.status(200).json({
            notes: notes.map(note => ({
                id: note._id,
                title: note.title,
                content: note.content,
                photoUrl: note.photoUrl,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                createdBy: note.userId._id,
                createdByName: note.userId.fullName,
                likes: note.likes || [],
                comments: note.comments || [],
            }))
        });
    }
    catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};
export const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const note = await Note.findOneAndDelete({ _id: id, userId });
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        res.status(200).json({ message: 'Note deleted successfully' });
    }
    catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};
export const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const userId = req.user._id;
        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }
        const note = await Note.findOneAndUpdate({ _id: id, userId }, { title, content }, { new: true });
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        res.status(200).json({
            message: 'Note updated successfully',
            note: {
                id: note._id,
                title: note.title,
                content: note.content,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
                createdBy: note.userId,
            }
        });
    }
    catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
};
//# sourceMappingURL=noteController.js.map