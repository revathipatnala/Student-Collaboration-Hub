export const editComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, commentId } = req.params;
    const { text } = req.body;
    const userId = req.user!._id;
    if (!text) {
      res.status(400).json({ error: 'Comment text required' });
      return;
    }
    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    const commentIdx = note.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIdx === -1) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    const comment = note.comments[commentIdx];
    if (!comment) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    if (!comment || comment.userId.toString() !== userId.toString()) {
      res.status(403).json({ error: 'Not authorized to edit this comment' });
      return;
    }
    comment.text = text;
    await note.save();
    res.status(200).json({ message: 'Comment updated', comments: note.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit comment' });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user!._id;
    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    const commentIdx = note.comments.findIndex(c => c._id.toString() === commentId);
    if (commentIdx === -1) {
      res.status(404).json({ error: 'Comment not found' });
      return;
    }
    const comment = note.comments[commentIdx];
    if (!comment || comment.userId.toString() !== userId.toString()) {
      res.status(403).json({ error: 'Not authorized to delete this comment' });
      return;
    }
    note.comments.splice(commentIdx, 1);
    await note.save();
    res.status(200).json({ message: 'Comment deleted', comments: note.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
export const addComment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user?._id;
    const userName = req.user?.fullName;
    console.log('[addComment] Params:', { id });
    console.log('[addComment] Body:', { text });
    console.log('[addComment] User:', { userId, userName });
    if (!text || !userId || !userName) {
      console.error('[addComment] Missing comment text or user info', { text, userId, userName });
      res.status(400).json({ error: 'Missing comment text or user info' });
      return;
    }
    const note = await Note.findById(id);
    if (!note) {
      console.error('[addComment] Note not found', { id });
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    note.comments.push({
      text, userId, userName, createdAt: new Date(),
      _id: undefined
    });
    await note.save();
    res.status(200).json({ message: 'Comment added', comments: note.comments });
  } catch (error) {
    console.error('[addComment] Internal error:', error);
    res.status(500).json({ error: 'Failed to add comment', details: (error as any)?.message });
  }
};

import mongoose from 'mongoose';
import Note from '../models/Note.js';
import type { AuthRequest } from '../middlewares/auth.js';
import type { Response } from 'express';

export const likeNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;
    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    if (note.likes.includes(userId)) {
      // If already liked, unlike (remove userId)
      note.likes = note.likes.filter((uid: mongoose.Types.ObjectId) => uid.toString() !== userId.toString());
      await note.save();
      res.status(200).json({ message: 'Note unliked', likes: note.likes.length });
    } else {
      // If not liked, like (add userId)
      note.likes.push(userId);
      await note.save();
      res.status(200).json({ message: 'Note liked', likes: note.likes.length });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to like note' });
  }
};

export const unlikeNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;
    const note = await Note.findById(id);
    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }
    note.likes = note.likes.filter((uid: mongoose.Types.ObjectId) => uid.toString() !== userId.toString());
    await note.save();
    res.status(200).json({ message: 'Note unliked', likes: note.likes.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlike note' });
  }
}
// ...existing code...

export const createNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const userId = req.user!._id;

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
  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({ error: 'Failed to create note' });
  }
};

export const getNotes = async (req: AuthRequest, res: Response): Promise<void> => {
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
        createdByName: (note.userId as unknown as { _id: string; fullName: string }).fullName,
        likes: note.likes || [],
        comments: note.comments || [],
      }))
    });
  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
};

export const deleteNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!._id;

    const note = await Note.findOneAndDelete({ _id: id, userId });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
};

export const updateNote = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    // For FormData, req.body fields may not be destructurable
    const title = req.body.title;
    const content = req.body.content;
    const userId = req.user!._id;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    let photoUrl;
    if (req.file) {
      // Dynamically import uploadToCloudinary
      const uploadToCloudinary = (await import('../utils/uploadToCloudinary.js')).default;
      const result = await uploadToCloudinary(req.file, 'notes');
      photoUrl = result.secure_url;
    }

    const updateFields: any = { title, content };
    if (photoUrl) {
      updateFields.photoUrl = photoUrl;
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId },
      updateFields,
      { new: true }
    );

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
        photoUrl: note.photoUrl,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        createdBy: note.userId,
      }
    });
  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({ error: 'Failed to update note' });
  }
};