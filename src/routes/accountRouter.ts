import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { addAccount, deleteAccount, getAccountById, getAccounts, getAccountsCombo, renewAccount, updateAccount } from '../controllers/accountController';


const router = express.Router();

router.get('/', verifyToken, getAccounts);
router.post('/', verifyToken, addAccount);
router.get('/combobox', verifyToken, getAccountsCombo);
router.get('/:id', verifyToken, getAccountById);
router.post('/:id', verifyToken, updateAccount);
router.delete('/:id', verifyToken, deleteAccount);
router.post('/renew/:id', verifyToken, renewAccount);

export default router;