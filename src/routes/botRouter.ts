import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { createIptvPremiunAccount, getBotExecutions, renewIptvPremiunAccount } from '../controllers/botController';


const router = express.Router();

router.post('/iptvPremiun', verifyToken, createIptvPremiunAccount);
router.post('/iptvPremiun/renew', verifyToken, renewIptvPremiunAccount);
router.get('/executions', verifyToken, getBotExecutions);

export default router;