import { Router } from 'express';
import { adminService } from '../services/adminService.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

// قفل جميع مسارات الأدمن
router.use(requireAuth, requireRole('ADMIN', 'Admin', 'admin'));
// 1. مسار الإحصائيات
router.get('/stats', async (_req, res) => {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. مسار جلب المستخدمين
router.get('/users', async (_req, res) => {
  try {
    const users = await adminService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. مسار حذف كورس
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;