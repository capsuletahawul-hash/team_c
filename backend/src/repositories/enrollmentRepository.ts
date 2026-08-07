import { prisma } from '../lib/prisma';

export const enrollmentRepository = {
  /**
   * إنشاء تسجيل جديد مع تحديث المقاعد المتاحة في الكورس داخل Transaction
   */
  async create(userId: string, courseId: string) {
    // نستخدم $transaction لضمان تنفيذ الشغلتين مع بعض أو إلغاء العمليتين لو حدث خطأ
    return await prisma.$transaction(async (tx) => {
      // 1. التأكد من وجود مقاعد شاغرة أولاً
      const course = await tx.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        throw new Error('Course not found');
      }

      if (course.seatsLeft <= 0) {
        throw new Error('No available seats left in this course');
      }

      // 2. إنقاص مقعد واحد من الكورس (Decrement)
      await tx.course.update({
        where: { id: courseId },
        data: {
          seatsLeft: {
            decrement: 1,
          },
        },
      });

      // 3. إنشاء سجّل التسجيل (Enrollment)
      const enrollment = await tx.enrollment.create({
        data: {
          userId,
          courseId,
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
    return await prisma.$transaction(async (tx) => {
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

      // 3. زيادة مقعد للمستودع المتاح (Increment)
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