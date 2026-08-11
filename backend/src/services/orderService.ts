import { orderRepository } from '../repositories/orderRepository.js';
import { courseRepository } from '../repositories/courseRepository.js';
import { enrollmentRepository } from '../repositories/enrollmentRepository.js';
import { AppError } from '../middleware/errorHandler.js';

export const orderService = {
  /**
   * ينشئ طلب PENDING بسعر الكورس الحقيقي من قاعدة البيانات — العميل لا يرسل السعر إطلاقاً
   */
  async createOrder(userId: string, courseId: string) {
    const course = await courseRepository.findById(courseId);

    if (!course) {
      throw new AppError('course_not_found', 404);
    }

    // قاعدة عمل: منع الشراء المزدوج لنفس الكورس
    const existingEnrollment = await enrollmentRepository.findUnique(userId, courseId);
    if (existingEnrollment) {
      throw new AppError('already_enrolled', 409);
    }

    return orderRepository.create({
      userId,
      courseId,
      amount: course.price, // السعر الرسمي يُنسخ الآن، لا يُقرأ لاحقاً وقت التحقق
    });
  },
};
