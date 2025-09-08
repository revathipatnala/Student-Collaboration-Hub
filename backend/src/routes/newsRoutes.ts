import express from 'express';
import { createNews, getNews, updateNews, deleteNews } from '../controllers/newsController.js';
const router = express.Router();

router.post('/', createNews);
router.get('/', getNews);
router.put('/:id', updateNews);
router.delete('/:id', deleteNews);

export default router;
