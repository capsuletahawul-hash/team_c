import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/errorHandler.js';

export const orderRepository = {
  async create(data: { userId: string; courseId: string; amount: number }) {
    try {
      return await prisma.order.create({
        data: {
          userId: data.userId,
          courseId: data.courseId,
          amount: data.amount,
          status: 'PENDING',
        },
      });
    } catch (err: any) {
      if (err?.code === 'P2003') {
        const constraint = err?.meta?.constraint || '';
        if (constraint.includes('userId')) {
          throw new AppError('user_not_found', 404);
        }
        if (constraint.includes('courseId')) {
          throw new AppError('course_not_found', 404);
        }
        throw new AppError('foreign_key_violation', 400);
      }
      throw err;
    }
  },

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        course: true,
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        course: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  async updateStatus(id: string, status: string, paymentId?: string) {
    return prisma.order.update({
      where: { id },
      data: {
        status,
        ...(paymentId !== undefined ? { paymentId } : {}),
      },
    });
  },
};