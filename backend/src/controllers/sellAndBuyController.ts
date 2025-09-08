// Like Item
export const likeSellAndBuy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const item = await SellAndBuy.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    if (item.likes.includes(userId)) {
      return res.status(400).json({ error: 'Already liked' });
    }
    item.likes.push(userId);
    await item.save();
    res.status(200).json({ message: 'Item liked', likes: item.likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like item' });
  }
};

// Unlike Item
export const unlikeSellAndBuy = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const item = await SellAndBuy.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    item.likes = item.likes.filter((uid: string) => uid !== userId);
    await item.save();
    res.status(200).json({ message: 'Item unliked', likes: item.likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlike item' });
  }
};

// Add Comment
export const addSellAndBuyComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, userId, userName } = req.body;
    if (!text || !userId || !userName) {
      return res.status(400).json({ error: 'Missing comment text, userId, or userName' });
    }
    const item = await SellAndBuy.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    item.comments.push({ text, userId, userName, createdAt: new Date() });
    await item.save();
    res.status(200).json({ message: 'Comment added', comments: item.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Edit Comment
export const editSellAndBuyComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { text, userId } = req.body;
    if (!text || !userId) {
      return res.status(400).json({ error: 'Missing comment text or userId' });
    }
    const item = await SellAndBuy.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const comment = item.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    comment.text = text;
    await item.save();
    res.status(200).json({ message: 'Comment updated', comments: item.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit comment' });
  }
};

// Delete Comment
export const deleteSellAndBuyComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const item = await SellAndBuy.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }
    const comment = item.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    comment.deleteOne();
    await item.save();
    res.status(200).json({ message: 'Comment deleted', comments: item.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

import type { Request, Response } from 'express';
import SellAndBuy from '../models/SellAndBuy.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import fs from 'fs';

export const createSellAndBuy = async (req: Request, res: Response) => {
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
  } catch (error) {
    res.status(500).json({ error: 'Failed to create sell/buy item' });
  }
};

export const getSellAndBuy = async (req: Request, res: Response) => {
  try {
    const items = await SellAndBuy.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sell/buy items' });
  }
};

export const updateSellAndBuy = async (req: Request, res: Response) => {
  try {
    let photoUrl = req.body.photoUrl;
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'sellandbuy');
      photoUrl = result.secure_url;
    }
    const updateData = { ...req.body };
    if (photoUrl) updateData.photoUrl = photoUrl;
    const item = await SellAndBuy.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sell/buy item' });
  }
};

export const deleteSellAndBuy = async (req: Request, res: Response) => {
  try {
    await SellAndBuy.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete sell/buy item' });
  }
};
