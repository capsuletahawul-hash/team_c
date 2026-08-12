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

    // Pass 4 distinct arguments to the repository
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