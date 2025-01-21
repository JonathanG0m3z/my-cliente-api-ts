import express from 'express';
import { verifyToken } from '../middlewares/jwtMiddleware';
import { addService, deleteService, getServices, getServicesCombo, updateService } from '../controllers/serviceController';

const router = express.Router();

router.get('/', verifyToken, getServices);
router.get('/combobox', verifyToken, getServicesCombo);
router.post('/', verifyToken, addService);
router.post('/:id', verifyToken, updateService);
router.delete('/:id', verifyToken, deleteService);

export default router;