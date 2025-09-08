import express from 'express';
import { createLostAndFound, getLostAndFound, updateLostAndFound, deleteLostAndFound } from '../controllers/lostAndFoundController.js';
import upload from '../utils/multer.js';
const router = express.Router();
router.post('/', upload.single('photo'), createLostAndFound);
router.get('/', getLostAndFound);
router.put('/:id', upload.single('photo'), updateLostAndFound);
router.delete('/:id', deleteLostAndFound);
export default router;
//# sourceMappingURL=lostAndFoundRoutes.js.map