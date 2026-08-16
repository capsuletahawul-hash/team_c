import { Router } from 'express';
import { adminService } from '../services/adminService.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { prisma } from '../lib/prisma.js';
import { adminController } from '../controllers/adminController.js';

const router = Router();

// حماية مسارات الأدمن
router.use(requireAuth, requireRole('ADMIN'));

router.get('/stats', async (_req, res) => {
  try {
    const stats = await adminService.getStats();
    res.json({ success: true, data: stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users', async (_req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// إيقاف أو تفعيل الكورس
router.patch('/courses/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      return res.status(404).json({ success: false, error: 'course_not_found' });
    }

    // تبديل الحالة
    const currentStatus = (course as any).status || 'published';
    const nextStatus = currentStatus === 'archived' ? 'published' : 'archived';

    const updated = await prisma.course.update({
      where: { id },
      data: { status: nextStatus } as any,
    });

    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// مسارات اعتماد وتذاكر الكورسات والعقود
router.get('/courses', adminController.getCourses);
router.put('/courses/:id/approve', adminController.approveCourse);
router.put('/courses/:id/reject', adminController.rejectCourse);

router.get('/contracts', adminController.getContracts);
router.put('/contracts/:id/approve', adminController.approveContract);
router.put('/contracts/:id/reject', adminController.rejectContract);

router.get('/tickets', adminController.getTickets);
router.put('/tickets/:id/status', adminController.updateTicketStatus);

export default router;