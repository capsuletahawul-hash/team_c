import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import type { CourseContext } from "../types/ai.js";

export const courseRepository = {
  async findById(id: string) {
    return prisma.course.findUnique({ where: { id } });
  },

  async create(data: Prisma.CourseUncheckedCreateInput) {
    return prisma.course.create({ data });
  },

  async update(id: string, data: Prisma.CourseUncheckedUpdateInput) {
    try {
      return await prisma.course.update({ where: { id }, data });
    } catch {
      return undefined;
    }
  },

  async delete(id: string) {
    try {
      await prisma.course.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
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
        include: {
          trainer: {
            select: {
              id: true,
              name: true,
              email: true,
              trainerProfile: true,
            },
          },
        },
      }),
      prisma.course.count(),
    ]);

    return {
      courses,
      total,
    };
  },

  /**
   * NEW — Handbook Ch. 06: "poor man's RAG". Fetches a bounded slice of
   * real, currently-visible course data to inject into the AI prompt as
   * context, instead of letting the model answer from training data (where
   * it would just invent plausible-sounding courses).
   *
   * Kept deliberately narrow (select only, capped limit, isVisible only):
   * every field returned here gets sent to the provider on every call and
   * billed as input tokens (Ch. 10), so this is a cost lever, not just a
   * query. Role 2 (aiService) calls this to build the system/user context.
   *
   * The `select` object is pulled out and typed with `satisfies` so the
   * row type below (CourseForAiContext) is derived from it directly —
   * this keeps `.map()` fully typed even before `prisma generate` has
   * been re-run, instead of silently falling back to `any`.
   */
  async findManyForAiContext(limit: number = 30): Promise<CourseContext[]> {
    const select = {
      id: true,
      title: true,
      description: true,
      category: true,
      level: true,
      price: true,
      durationWeeks: true,
      status: true,
      seatsLeft: true,
      trainer: {
        select: { name: true },
      },
    } satisfies Prisma.CourseSelect;

    type CourseForAiContext = Prisma.CourseGetPayload<{ select: typeof select }>;

    const courses = await prisma.course.findMany({
      where: { isVisible: true },
      select,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return courses.map((c: CourseForAiContext) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      level: c.level,
      price: c.price,
      durationWeeks: c.durationWeeks,
      status: c.status,
      seatsLeft: c.seatsLeft,
      trainerName: c.trainer?.name ?? "Unknown",
    }));
  },
};