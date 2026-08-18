// src/services/accessService.ts
import { enrollmentRepository } from '../repositories/enrollmentRepository.js';

export const accessService = {
  /**
   * Grant time-limited access (120 days) after a verified payment.
   */
  async grantAccess(userId: string, courseId: string) {
    const now = new Date();
    const oneHundredTwentyDays = 120 * 24 * 60 * 60 * 1000;
    const endsAt = new Date(now.getTime() + oneHundredTwentyDays);

    // upsert: إذا وُجد سجل تسجيل سابق نُحدّث وقت الانتهاء فقط بدلاً من إنشاء واحد جديد
    const existing = await enrollmentRepository.findUnique(userId, courseId);
    if (existing) {
      const { prisma } = await import('../lib/prisma.js');
      return prisma.enrollment.update({
        where: { id: existing.id },
        data: { accessStartsAt: now, accessEndsAt: endsAt },
      });
    }
    return enrollmentRepository.create(userId, courseId, now, endsAt);
  },

  /**
   * Check if a user currently holds active access to a course.
   */
  async hasActiveAccess(userId: string, courseId: string): Promise<boolean> {
    // Reusing the repository method your teammate used
    const enrollment = await enrollmentRepository.findUnique(userId, courseId);

    if (!enrollment) {
      return false;
    }

    const now = new Date();

    // Check: accessStartsAt <= now AND now <= accessEndsAt
    const isActive = 
      enrollment.accessStartsAt <= now && 
      now <= enrollment.accessEndsAt;

    return isActive;
  }
};