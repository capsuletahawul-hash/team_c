import { prisma } from "../lib/prisma.js";

export const courseRepository = {
  async findById(id: string) {
    return prisma.course.findUnique({ where: { id } });
  },

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.course.count(),
    ]);

    return {
      courses,
      total,
    };
  },
};