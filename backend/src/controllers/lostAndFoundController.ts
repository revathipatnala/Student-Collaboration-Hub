// Add a comment
export const addLostAndFoundComment = async (req: Request, res: Response) => {
  try {
    const { text, userId, userName } = req.body;
    if (!text || !userId || !userName) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const item = await LostAndFound.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    item.comments.push({ text, userId, userName, createdAt: new Date() });
    await item.save();
    res.json({ comments: item.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Edit a comment
export const editLostAndFoundComment = async (req: Request, res: Response) => {
  try {
    const { text, userId } = req.body;
    if (!text || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const item = await LostAndFound.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
    const comment = item.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    if (comment.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
    comment.text = text;
    await item.save();
    res.json({ comments: item.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit comment' });
  }
};

// Delete a comment
export const deleteLostAndFoundComment = async (req: Request, res: Response) => {
  try {
    const userId = req.body.userId || req.query.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const item = await LostAndFound.findById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Item not found' });
  if (!Array.isArray(item.comments)) return res.status(404).json({ error: 'No comments found' });
  const commentIdx = item.comments.findIndex((c: any) => c._id?.toString() === req.params.commentId);
  if (commentIdx === -1) return res.status(404).json({ error: 'Comment not found' });
  if (item.comments[commentIdx].userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
  item.comments.splice(commentIdx, 1);
  await item.save();
  res.json({ comments: item.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

import LostAndFound from '../models/LostAndFound.js';
import type { Request, Response } from 'express';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import fs from 'fs';

export const createLostAndFound = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lost and found item' });
  }
};

export const getLostAndFound = async (req: Request, res: Response) => {
  try {
    const items = await LostAndFound.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lost and found items' });
  }
};

export const updateLostAndFound = async (req: Request, res: Response) => {
  try {
    let photoUrl = req.body.photoUrl;
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'lostandfound');
      photoUrl = result.secure_url;
    }
    const updateData = { ...req.body };
    if (photoUrl) updateData.photoUrl = photoUrl;
    const item = await LostAndFound.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lost and found item' });
  }
};

export const deleteLostAndFound = async (req: Request, res: Response) => {
  try {
    await LostAndFound.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lost and found item' });
  }
};
