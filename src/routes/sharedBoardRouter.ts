import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { addAccount, addSharedBoard, deleteAccount, getAccounts, getAccountsToRenewIptv, getSharedBoards, reactivateAccount, updateAccount } from '../controllers/sharedBoardController';

const router = express.Router();

router.get('/', verifyToken, getSharedBoards);
router.post('/', verifyToken, addSharedBoard);
router.post('/accounts', verifyToken, addAccount);
router.post('/accounts/:id', verifyToken, updateAccount);
router.delete('/accounts/:id', verifyToken, deleteAccount);
router.put('/accounts/:id', verifyToken, reactivateAccount);
router.get('/accounts/:sharedBoardId', verifyToken, getAccounts);
router.get('/renewIptvAccounts/:sharedBoardId', verifyToken, getAccountsToRenewIptv);

export default router;