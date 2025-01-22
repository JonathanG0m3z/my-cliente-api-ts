import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { addSale, deleteSale, getSaleById, getSales, renewSale, updateSale } from '../controllers/saleController';


const router = express.Router();

router.get('/', verifyToken, getSales);
router.post('/', verifyToken, addSale);
router.get('/:id', verifyToken, getSaleById);
router.post('/:id', verifyToken, updateSale);
router.delete('/:id', verifyToken, deleteSale);
router.post('/renew/:id', verifyToken, renewSale);

export default router;