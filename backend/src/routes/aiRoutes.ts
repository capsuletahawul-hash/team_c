import { Router } from 'express';
import { askAboutCourses } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// التأكد من تمرير الدوال المعرفة
router.post('/ask', requireAuth, askAboutCourses);

export default router;