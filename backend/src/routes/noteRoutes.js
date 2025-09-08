import express from 'express';
import { createNote, getNotes, deleteNote, updateNote, likeNote, unlikeNote, addComment } from '../controllers/noteController.js';
import upload from '../utils/multer.js';
import { authenticateToken } from '../middlewares/auth.js';
const router = express.Router();
// Add comment endpoint
router.post('/:id/comment', addComment);
// Protect all note routes
router.use(authenticateToken);
// Note routes
router.post('/', upload.single('photo'), createNote);
router.get('/', getNotes);
// Like/unlike endpoints
router.post('/:id/like', likeNote);
router.post('/:id/unlike', unlikeNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
export default router;
//# sourceMappingURL=noteRoutes.js.map