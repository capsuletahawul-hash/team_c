import { Router } from 'express';
import { paymentController } from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/checkout', requireAuth, paymentController.startCheckout);

router.get('/return', paymentController.handleCallback);

export default router;