
import express from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent, likeEvent, unlikeEvent, addEventComment, editEventComment, deleteEventComment } from '../controllers/eventController.js';
import upload from '../utils/multer.js';
const router = express.Router();

// Like/unlike endpoints
router.post('/:id/like', likeEvent);
router.post('/:id/unlike', unlikeEvent);

// Comment endpoints
router.post('/:id/comment', addEventComment);
router.put('/:id/comment/:commentId', editEventComment);
router.delete('/:id/comment/:commentId', deleteEventComment);

router.post('/', upload.single('photo'), createEvent);
router.get('/', getEvents);
router.put('/:id', upload.single('photo'), updateEvent);
router.delete('/:id', deleteEvent);

export default router;
