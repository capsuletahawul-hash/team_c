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
        status: true,
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

// تعديل صلاحية حساب المستخدم
router.patch('/users/:id/role', async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    const updated = await prisma.user.update({
      where: { id },
      data: { role },
    });
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// قفل / تنشيط وضع حساب المستخدم
router.patch('/users/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ success: false, error: 'user_not_found' });
    }
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const updated = await prisma.user.update({
      where: { id },
      data: { status: nextStatus },
    });
    res.json({ success: true, data: updated });
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

// جلب كل الكورسات بشكل كامل لإدارة CRUD (منفصل عن صفحة الاعتماد)
router.get('/courses/crud', async (_req, res) => {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        level: true,
        price: true,
        durationWeeks: true,
        maxStudents: true,
        trainerId: true,
        status: true,
        isVisible: true,
        createdAt: true,
        trainer: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: courses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/contracts', adminController.getContracts);
router.put('/contracts/:id/approve', adminController.approveContract);
router.put('/contracts/:id/reject', adminController.rejectContract);

router.get('/tickets', adminController.getTickets);
router.put('/tickets/:id/status', adminController.updateTicketStatus);

// جلب الطلبات (Orders UI) - مربوط بمتحكم الأدمن
router.get('/orders', adminController.getOrders);

// جلب الاشتراكات (Enrollments UI) - مربوط بمتحكم الأدمن
router.get('/enrollments', adminController.getEnrollments);

// إضافة كورس جديد (Create Course)
router.post('/courses', async (req, res) => {
  try {
    const { title, description, category, level, price, durationWeeks, maxStudents, trainerId } = req.body;
    let tId = trainerId;
    if (!tId) {
      const trainer = await prisma.user.findFirst({ where: { role: 'TRAINER' } });
      if (trainer) {
        tId = trainer.id;
      } else {
        const firstUser = await prisma.user.findFirst();
        if (firstUser) tId = firstUser.id;
      }
    }

    if (!tId) {
      return res.status(400).json({ success: false, error: 'No trainer available on the platform. Please register a trainer first.' });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        category,
        level: level || 'beginner',
        price: parseInt(price) || 0,
        durationWeeks: parseInt(durationWeeks) || 0,
        maxStudents: parseInt(maxStudents) || 30,
        seatsLeft: parseInt(maxStudents) || 30,
        trainerId: tId,
        status: 'coming_soon',
        isVisible: true,
      },
    });
    res.status(201).json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// تعديل كورس (Edit Course)
router.patch('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, level, price, durationWeeks, maxStudents, trainerId } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (level !== undefined) updateData.level = level;
    if (price !== undefined) updateData.price = parseInt(price) || 0;
    if (durationWeeks !== undefined) updateData.durationWeeks = parseInt(durationWeeks) || 0;
    if (maxStudents !== undefined) updateData.maxStudents = parseInt(maxStudents) || 30;
    if (trainerId !== undefined && trainerId !== '') updateData.trainerId = trainerId;

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
    });
    res.json({ success: true, data: course });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// حذف كورس (Delete Course)
router.delete('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.course.delete({ where: { id } });
    res.json({ success: true, message: 'course_deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;