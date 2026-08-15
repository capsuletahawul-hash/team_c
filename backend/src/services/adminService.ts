import { prisma } from '../lib/prisma.js';

export const adminService = {
  // 1. حساب الإحصائيات من الداتابيس
  async getStats() {
    const totalUsers = await prisma.user.count();
    
    // حساب الاشتراكات النشطة التي لم تنتهِ بعد
    const activeEnrollments = await prisma.enrollment.count({
      where: { accessEndsAt: { gte: new Date() } },
    });

    // جمع إجمالي المبيعات للطلبات المدفوعة
    const revenueAgg = await prisma.order.aggregate({
      where: { status: 'PAID' },
      _sum: { amount: true },
    });

    return {
      totalUsers,
      activeEnrollments,
      totalRevenue: revenueAgg._sum.amount || 0,
    };
  },

  // 2. جلب جميع المستخدمين بأمان بدون الباسورد
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: { select: { enrollments: true } },
      },
    });
  },
};