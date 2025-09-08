import express from 'express';
import { createSellAndBuy, getSellAndBuy, updateSellAndBuy, deleteSellAndBuy } from '../controllers/sellAndBuyController.js';
import upload from '../utils/multer.js';
const router = express.Router();
router.post('/', upload.single('photo'), createSellAndBuy);
router.get('/', getSellAndBuy);
router.put('/:id', upload.single('photo'), updateSellAndBuy);
router.delete('/:id', deleteSellAndBuy);
export default router;
//# sourceMappingURL=sellAndBuyRoutes.js.map