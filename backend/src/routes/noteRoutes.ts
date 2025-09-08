import express from 'express';
import {
  createNote,
  getNotes,
  deleteNote,
  updateNote,
  likeNote,
  unlikeNote,
  addComment,
  editComment,
  deleteComment
} from '../controllers/noteController.js';
import upload from '../utils/multer.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Protect all note routes
router.use(authenticateToken);

// Add comment endpoint
router.post('/:id/comment', addComment);
// Edit comment endpoint
router.put('/:id/comment/:commentId', editComment);
// Delete comment endpoint
router.delete('/:id/comment/:commentId', deleteComment);

// Note routes
router.post('/', upload.single('photo'), createNote);
router.get('/', getNotes);

// Like/unlike endpoints
router.post('/:id/like', likeNote);
router.post('/:id/unlike', unlikeNote);

router.put('/:id', upload.single('photo'), updateNote);
router.delete('/:id', deleteNote);

export default router;