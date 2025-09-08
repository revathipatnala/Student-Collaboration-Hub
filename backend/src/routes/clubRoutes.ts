import { Router } from 'express';
import { getClubs, createClub, deleteClub, updateClub, likeClub, unlikeClub, addClubComment, editClubComment, deleteClubComment } from '../controllers/clubController.js';
import upload from '../utils/multer.js';

const router = Router();
// Like/unlike endpoints
router.post('/:id/like', likeClub);
router.post('/:id/unlike', unlikeClub);

// Comment endpoints
router.post('/:id/comment', addClubComment);
router.put('/:id/comment/:commentId', editClubComment);
router.delete('/:id/comment/:commentId', deleteClubComment);

// Get all clubs
router.get('/', getClubs);

// Create a new club
router.post('/', upload.single('photo'), createClub);

// Delete a club
router.delete('/:id', deleteClub);

// Update a club
router.put('/:id', upload.single('photo'), updateClub);

export default router;
