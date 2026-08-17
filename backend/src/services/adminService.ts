import { prisma } from '../lib/prisma.js';
import { courseRepository } from '../repositories/courseRepository.js';
import type { Prisma } from '@prisma/client';

export const adminService = {
  // إدارة الكورسات (Create/Update/Delete) — Week 6 Admin Course CRUD
  async createCourse(data: Prisma.CourseUncheckedCreateInput) {
    return courseRepository.create(data);
  },

  async updateCourse(id: string, data: Prisma.CourseUncheckedUpdateInput) {
    return courseRepository.update(id, data);
  },

  async deleteCourse(id: string) {
    return courseRepository.delete(id);
  },
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