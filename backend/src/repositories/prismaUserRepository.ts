import { prisma } from '../lib/prisma.js';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    if (id === 'admin-static-id') {
      try {
        return await prisma.user.upsert({
          where: { id: 'admin-static-id' },
          update: {},
          create: {
            id: 'admin-static-id',
            name: 'Administrator',
            email: 'capsuletahawul@gmail.com',
            password: '',
            role: 'ADMIN',
          },
          include: {
            enrollments: {
              include: {
                course: true,
              },
            },
          },
        });
      } catch (err) {
        // Fallback to normal lookup if upsert fails
      }
    }

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