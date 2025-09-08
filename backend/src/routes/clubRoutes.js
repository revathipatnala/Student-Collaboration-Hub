import { Router } from 'express';
import { getClubs, createClub, deleteClub, updateClub } from '../controllers/clubController.js';
import upload from '../utils/multer.js';
const router = Router();
// Get all clubs
router.get('/', getClubs);
// Create a new club
router.post('/', upload.single('photo'), createClub);
// Delete a club
router.delete('/:id', deleteClub);
// Update a club
router.put('/:id', upload.single('photo'), updateClub);
export default router;
//# sourceMappingURL=clubRoutes.js.map