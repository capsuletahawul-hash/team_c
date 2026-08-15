import { orderRepository } from '../repositories/orderRepository.js';
import { courseRepository } from '../repositories/courseRepository.js';
import { accessService } from '../services/accessService.js';
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

    // FIX: previously checked enrollmentRepository.findUnique() for ANY
    // enrollment row, which permanently blocked re-purchase after a
    // student's 120-day access expired (the row still exists, just expired).
    // The business rule is "no double purchase of ACTIVE access", so this
    // must go through accessService.hasActiveAccess() instead.
    const alreadyHasAccess = await accessService.hasActiveAccess(userId, courseId);
    if (alreadyHasAccess) {
      throw new AppError('already_enrolled', 409);
    }

    return orderRepository.create({
      userId,
      courseId,
      amount: course.price, // السعر الرسمي يُنسخ الآن، لا يُقرأ لاحقاً وقت التحقق
    });
  },

async getOrder(userId: string, orderId: string) {
  const order = await orderRepository.findById(orderId);

  if (!order) {
    throw new AppError('order_not_found', 404);
  }

  if (order.userId !== userId) {
    throw new AppError('forbidden', 403);
  }

  return order;
},

};