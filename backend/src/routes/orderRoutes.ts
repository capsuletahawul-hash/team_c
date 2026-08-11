import { Router } from 'express';

import { orderController } from '../controllers/orderController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', requireAuth, requireRole('Student', 'Trainer'), orderController.createOrder);

export default router;
