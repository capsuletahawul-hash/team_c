import { prisma } from '../lib/prisma.js';
import type { Prisma } from '@prisma/client';

export const enrollmentRepository = {
  /**
   * إنشاء تسجيل جديد مع تحديث المقاعد المتاحة في الكورس داخل Transaction
   */
  async create(userId: string, courseId: string, accessStartsAt: Date, accessEndsAt: Date) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. إيجاد الكورس
      const course = await tx.course.findUnique({
        where: { id: courseId },
      });

      // 2. إنقاص مقعد واحد من الكورس إذا كان متوفراً أكبر من 0
      if (course && course.seatsLeft && course.seatsLeft > 0) {
        await tx.course.update({
          where: { id: courseId },
          data: {
            seatsLeft: {
              decrement: 1,
            },
          },
        });
      }

      // 3. إنشاء سجّل التسجيل (Enrollment)
      const enrollment = await tx.enrollment.create({
        data: {
          userId,
          courseId,
          accessStartsAt,
          accessEndsAt,
        },
        include: {
          course: true,
          user: true,
        },
      });

      return enrollment;
    });
  },

  /**
   * إلغاء التسجيل وإرجاع المقعد للكورس
   */
  async delete(userId: string, courseId: string) {
    return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. إيجاد التسجيل
      const enrollment = await tx.enrollment.findFirst({
        where: { userId, courseId },
      });

      if (!enrollment) {
        throw new Error('Enrollment record not found');
      }

      // 2. حذف التسجيل
      await tx.enrollment.delete({
        where: { id: enrollment.id },
      });

      // 3. زيادة مقعد للكورس المتاح (Increment)
      await tx.course.update({
        where: { id: courseId },
        data: {
          seatsLeft: {
            increment: 1,
          },
        },
      });

      return { success: true };
    });
  },

  /**
   * التحقق مما إذا كان الطالب مسجلاً في الكورس مسبقاً
   */
  async findUnique(userId: string, courseId: string) {
    return await prisma.enrollment.findFirst({
      where: {
        userId,
        courseId,
      },
    });
  },

  /**
   * جلب جميع تسجيلات طالب معين
   */
  async findByUserId(userId: string) {
    return await prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: true,
      },
    });
  },
};