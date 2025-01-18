import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { createUser, getAdminBalance, getBalanceById, googleAuth, logOut, updateBalance, validateUser } from '../controllers/userController';

const router = express.Router();

router.post('/', createUser);
router.post('/validate', validateUser);
router.get('/logOut', verifyToken, logOut);
router.post('/signin', googleAuth);
router.get('/getBalance', verifyToken, getBalanceById);
router.get('/getAdminBalance/:id', verifyToken, getAdminBalance);
router.post('/updateBalance', verifyToken, updateBalance);

export default router;