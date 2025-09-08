// Like Event
export const likeEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
  const event = await Event.findById(id) as any;
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (event.likes.includes(userId)) {
      return res.status(400).json({ error: 'Already liked' });
    }
    event.likes.push(userId);
    await event.save();
    res.status(200).json({ message: 'Event liked', likes: event.likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to like event' });
  }
};

// Unlike Event
export const unlikeEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
  const event = await Event.findById(id) as any;
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    event.likes = event.likes.filter((uid: string) => uid !== userId);
    await event.save();
    res.status(200).json({ message: 'Event unliked', likes: event.likes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unlike event' });
  }
};

// Add Comment
export const addEventComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { text, userId, userName } = req.body;
    if (!text || !userId || !userName) {
      return res.status(400).json({ error: 'Missing comment text, userId, or userName' });
    }
  const event = await Event.findById(id) as any;
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    event.comments.push({ text, userId, userName, createdAt: new Date() });
    await event.save();
    res.status(200).json({ message: 'Comment added', comments: event.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

// Edit Comment
export const editEventComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { text, userId } = req.body;
    if (!text || !userId) {
      return res.status(400).json({ error: 'Missing comment text or userId' });
    }
  const event = await Event.findById(id) as any;
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const comment = event.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    comment.text = text;
    await event.save();
    res.status(200).json({ message: 'Comment updated', comments: event.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to edit comment' });
  }
};

// Delete Comment
export const deleteEventComment = async (req: Request, res: Response) => {
  try {
    const { id, commentId } = req.params;
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }
  const event = await Event.findById(id) as any;
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const comment = event.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    comment.deleteOne();
    await event.save();
    res.status(200).json({ message: 'Comment deleted', comments: event.comments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
};
import Event from '../models/Event.js';
import type { Request, Response } from 'express';
import uploadToCloudinary from '../utils/uploadToCloudinary.js';

// ✅ Create Event
export const createEvent = async (req: Request, res: Response) => {
  try {
    let photoUrl = '';
    console.log('Received file:', req.file);

    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, 'events');
        console.log('Cloudinary upload result:', result);
        photoUrl = result.secure_url;
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
      }
    }

    const event = new Event({
      ...req.body,
      photoUrl,
    });

    await event.save();
    console.log('Saved event:', event);
    res.status(201).json(event);
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// ✅ Get Events
export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

// ✅ Update Event
export const updateEvent = async (req: Request, res: Response) => {
  try {
    let photoUrl = req.body.photoUrl || '';
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file, 'events');
        photoUrl = result.secure_url;
      } catch (cloudErr) {
        console.error('Cloudinary upload error:', cloudErr);
      }
    }
    const updateData = { ...req.body };
    if (photoUrl) {
      updateData.photoUrl = photoUrl;
    }
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
};

// ✅ Delete Event
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
};
