import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { getBalanceById } from '../controllers/userController';

const router = express.Router();

router.get('/getBalance', verifyToken, getBalanceById);

export default router;