// Like Club
export const likeClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    if (club.likes.includes(userId)) {
      return res.status(400).json({ error: 'Already liked' });
    }
    club.likes.push(userId);
    await club.save();
    res.status(200).json({ message: 'Club liked', likes: club.likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like club' });
  }
};

// Unlike Club
export const unlikeClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    club.likes = club.likes.filter((uid: string) => uid !== userId);
    await club.save();
    res.status(200).json({ message: 'Club unliked', likes: club.likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlike club' });
  }
};

// Add Comment
export const addClubComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, userId, userName } = req.body;
    if (!text || !userId || !userName) {
      return res.status(400).json({ error: 'Missing comment text, userId, or userName' });
    }
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    club.comments.push({ text, userId, userName, createdAt: new Date() });
    await club.save();
    res.status(200).json({ message: 'Comment added', comments: club.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Edit Comment
export const editClubComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { text, userId } = req.body;
    if (!text || !userId) {
      return res.status(400).json({ error: 'Missing comment text or userId' });
    }
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    const commentIndex = club.comments.findIndex((c: any) => c._id?.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (!club.comments[commentIndex] || club.comments[commentIndex].userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    club.comments[commentIndex].text = text;
    await club.save();
    res.status(200).json({ message: 'Comment updated', comments: club.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit comment' });
  }
};

// Delete Comment
export const deleteClubComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
    const club = await Club.findById(id);
    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }
    const commentIndex = club.comments.findIndex((c: any) => c._id?.toString() === commentId);
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (!club.comments[commentIndex] || club.comments[commentIndex].userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    club.comments.splice(commentIndex, 1);
    await club.save();
    res.status(200).json({ message: 'Comment deleted', comments: club.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};

import type { Request, Response } from 'express';
import Club from '../models/Club.js';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';
import fs from 'fs';

// Get all clubs
export const getClubs = async (req: Request, res: Response) => {
  try {
    const clubs = await Club.find();
    res.json(clubs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch clubs' });
  }
};

// Create a new club
export const createClub = async (req: Request, res: Response) => {
  try {
    let photoUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file, 'clubs');
      photoUrl = result.secure_url;
    }
    const { name, description, allowedYears, whatsappGroupLink, presidentName, contactNo, createdBy } = req.body;
    const club = new Club({
      name,
      description,
      allowedYears: Array.isArray(allowedYears) ? allowedYears : JSON.parse(allowedYears),
      whatsappGroupLink,
      presidentName,
      contactNo,
      createdBy,
      members: [],
      photoUrl,
    });
    await club.save();
    res.status(201).json(club);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create club' });
  }
};

// Delete a club
export const deleteClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Club.findByIdAndDelete(id);
    res.json({ message: 'Club deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete club' });
  }
};

// Update a club
export const updateClub = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const update = req.body;
    if (update.allowedYears && !Array.isArray(update.allowedYears)) {
      update.allowedYears = JSON.parse(update.allowedYears);
    }
    const club = await Club.findByIdAndUpdate(id, update, { new: true });
    res.json(club);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update club' });
  }
};
