import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { createIptvPremiunAccount, renewIptvPremiunAccount } from '../controllers/botController';


const router = express.Router();

router.post('/iptvPremiun', verifyToken, createIptvPremiunAccount);
router.post('/iptvPremiun/renew', verifyToken, renewIptvPremiunAccount);

export default router;