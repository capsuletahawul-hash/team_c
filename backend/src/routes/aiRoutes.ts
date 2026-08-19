import { Router } from 'express';
import { askAboutCourses } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/aiRateLimiter.js';
import { enforceCostCap } from '../middleware/aiCostTracker.js';

const router = Router();

// التأكد من تمرير الدوال المعرفة
router.post('/ask', requireAuth, aiRateLimiter, enforceCostCap, askAboutCourses);

export default router;