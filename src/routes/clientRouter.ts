import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { getClientsCombobox, updateClient } from '../controllers/clientController';

const router = express.Router();

router.get('/combobox', verifyToken, getClientsCombobox);
router.post('/:id', verifyToken, updateClient);

export default router;