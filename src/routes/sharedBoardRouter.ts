import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { addSharedBoard, getSharedBoards } from '../controllers/sharedBoardController';

const router = express.Router();

router.get('/', verifyToken, getSharedBoards);
router.post('/', verifyToken, addSharedBoard);
// router.post('/accounts', verifyToken, sharedBoardController.addAccount);
// router.post('/accounts/:id', verifyToken, sharedBoardController.updateAccount);
// router.delete('/accounts/:id', verifyToken, sharedBoardController.deleteAccount);
// router.put('/accounts/:id', verifyToken, sharedBoardController.reactivateAccount);
// router.get('/accounts/:sharedBoardId', verifyToken, sharedBoardController.getAccounts);
// router.get('/renewIptvAccounts/:sharedBoardId', verifyToken, sharedBoardController.getAccountsToRenewIptv);

export default router;