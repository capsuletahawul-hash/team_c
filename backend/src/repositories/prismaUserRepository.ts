import { prisma } from '../lib/prisma.js';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: true,
          },
        },
      },
    });
  },

  async create(data: any) {
    return prisma.user.create({
      data,
    });
  },

  async updateName(id: string, name: string) {
    return prisma.user.update({
      where: { id },
      data: { name },
    });
  },

  async updateProfile(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },
};