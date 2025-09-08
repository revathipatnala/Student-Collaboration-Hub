import express from 'express';
import { createEvent, getEvents, updateEvent, deleteEvent } from '../controllers/eventController.js';
import upload from '../utils/multer.js';
const router = express.Router();
router.post('/', upload.single('photo'), createEvent);
router.get('/', getEvents);
router.put('/:id', upload.single('photo'), updateEvent);
router.delete('/:id', deleteEvent);
export default router;
//# sourceMappingURL=eventRoutes.js.map