import { prisma } from '../lib/prisma.js';

export const orderRepository = {
  async create(data: { userId: string; courseId: string; amount: number }) {
    return prisma.order.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
        amount: data.amount,
        status: 'PENDING',
      },
    });
  },

  async findById(id: string) {
    return prisma.order.findUnique({ where: { id } });
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
