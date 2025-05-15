import express from 'express';
import { createAccountWebhook, renewAccountWebhook } from '../controllers/webhookController';


const router = express.Router();

router.post('/createAccount', createAccountWebhook);
router.post('/renewAccount', renewAccountWebhook);
// router.get('/executions', getBotExecutions);

export default router;