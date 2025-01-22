import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { createIptvPremiunAccount, createLattvAccount, renewIptvPremiunAccount } from '../controllers/botController';


const router = express.Router();

router.post('/lattv', verifyToken, createLattvAccount);
router.post('/iptvPremiun', verifyToken, createIptvPremiunAccount);
router.post('/iptvPremiun/renew', verifyToken, renewIptvPremiunAccount);

export default router;