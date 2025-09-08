import express from 'express';
import { createSellAndBuy, getSellAndBuy, updateSellAndBuy, deleteSellAndBuy, likeSellAndBuy, unlikeSellAndBuy, addSellAndBuyComment, editSellAndBuyComment, deleteSellAndBuyComment } from '../controllers/sellAndBuyController.js';
const router = express.Router();
router.post('/:id/like', likeSellAndBuy);
router.post('/:id/unlike', unlikeSellAndBuy);

// Comment endpoints
router.post('/:id/comment', addSellAndBuyComment);
router.put('/:id/comment/:commentId', editSellAndBuyComment);
router.delete('/:id/comment/:commentId', deleteSellAndBuyComment);
import upload from '../utils/multer.js';

router.post('/', upload.single('photo'), createSellAndBuy);
router.get('/', getSellAndBuy);
router.put('/:id', upload.single('photo'), updateSellAndBuy);
router.delete('/:id', deleteSellAndBuy);

export default router;
