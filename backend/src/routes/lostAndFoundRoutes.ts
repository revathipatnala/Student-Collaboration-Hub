import express from 'express';
import { createLostAndFound, getLostAndFound, updateLostAndFound, deleteLostAndFound, addLostAndFoundComment, editLostAndFoundComment, deleteLostAndFoundComment } from '../controllers/lostAndFoundController.js';
// ...existing code...
import upload from '../utils/multer.js';
const router = express.Router();

router.post('/', upload.single('photo'), createLostAndFound);
router.get('/', getLostAndFound);
router.put('/:id', upload.single('photo'), updateLostAndFound);
router.delete('/:id', deleteLostAndFound);

// Comment endpoints
router.post('/:id/comment', addLostAndFoundComment);
router.put('/:id/comment/:commentId', editLostAndFoundComment);
router.delete('/:id/comment/:commentId', deleteLostAndFoundComment);

export default router;
