import { prisma } from '../lib/prisma.js';

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },
  async create(data: any) {
    return prisma.user.create({ data });
  },
};