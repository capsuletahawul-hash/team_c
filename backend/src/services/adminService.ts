import { prisma } from '../lib/prisma.js';

export const adminService = {
  // حساب الإحصائيات من الداتابيس عبر Prisma Aggregates
  async getStats() {
    const totalUsers = await prisma.user.count();
    
    // عدد الاشتراكات النشطة التي لم تنتهِ صلاحيتها
    const activeEnrollments = await prisma.enrollment.count({
      where: {
        accessEndsAt: {
          gte: new Date(),
        },
      },
    });

    // إجمالي المبيعات للطلبات المسددة
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

  // جلب المستخدمين بدون إرجاع الباسورد
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { enrollments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};