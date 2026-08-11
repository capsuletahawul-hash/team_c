import { prisma } from '../lib/prisma.js';

export interface TrainerCourse {
  id: string;
  trainerId: string;
  title: string;
  category: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  durationWeeks: number;
  maxStudents: number;
  videoDurationMinutes: number;
  requirementsNotes: string;
  students: number;
  rating: number;
  status: 'available' | 'coming_soon' | 'pending_deletion' | 'rejected';
  isVisible: boolean;
  createdAt: string;
}

export type CreateCourseInput = Omit<
  TrainerCourse,
  'id' | 'trainerId' | 'students' | 'rating' | 'status' | 'isVisible' | 'createdAt'
>;

export interface TrainerProfileExtra {
  phone: string;
  bio: string;
  bioAr?: string;
  specialty: string;
  specialtyAr?: string;
  experience: number;
}

interface CourseRow {
  id: string;
  trainerId: string;
  title: string;
  category: string;
  description: string;
  level: string;
  price: number;
  durationWeeks: number;
  maxStudents: number;
  videoDurationMinutes: number;
  requirementsNotes: string;
  status: string;
  isVisible: boolean;
  rating: number;
  createdAt: Date;
  _count?: { enrollments: number };
}

// يحول سجل الكورس من شكل Prisma (Date, _count) إلى الشكل اللي تتوقعه الكنترولرز
function toTrainerCourse(course: CourseRow): TrainerCourse {
  return {
    id: course.id,
    trainerId: course.trainerId,
    title: course.title,
    category: course.category,
    description: course.description,
    level: course.level as TrainerCourse['level'],
    price: course.price,
    durationWeeks: course.durationWeeks,
    maxStudents: course.maxStudents,
    videoDurationMinutes: course.videoDurationMinutes,
    requirementsNotes: course.requirementsNotes,
    students: course._count?.enrollments ?? 0,
    rating: course.rating,
    status: course.status as TrainerCourse['status'],
    isVisible: course.isVisible,
    createdAt: course.createdAt.toISOString(),
  };
}

const withStudentsCount = { _count: { select: { enrollments: true } } } as const;

export const trainerRepository = {
  // جدول Trainer بقاعدة البيانات (منفصل عن User، مربوط بـ userId) — انظر backend/prisma/schema.prisma
  async findAll() {
    return prisma.trainer.findMany();
  },

  async findById(id: string) {
    return prisma.trainer.findUnique({ where: { id } });
  },

  async create(data: {
    userId: string;
    name: string;
    email: string;
    bio?: string;
    specialization?: string;
  }) {
    return prisma.trainer.create({ data });
  },

  async update(
    id: string,
    data: Partial<{ name: string; email: string; bio: string; specialization: string }>
  ) {
    return prisma.trainer.update({ where: { id }, data });
  },

  async listCoursesByTrainer(trainerId: string): Promise<TrainerCourse[]> {
    const courses = await prisma.course.findMany({
      where: { trainerId },
      include: withStudentsCount,
    });
    return courses.map(toTrainerCourse);
  },

  async createCourse(trainerId: string, data: CreateCourseInput): Promise<TrainerCourse> {
    const course = await prisma.course.create({
      data: { ...data, trainerId, status: 'coming_soon', isVisible: true, rating: 0 },
      include: withStudentsCount,
    });
    return toTrainerCourse(course);
  },

  async findCourseById(id: string): Promise<TrainerCourse | undefined> {
    const course = await prisma.course.findUnique({
      where: { id },
      include: withStudentsCount,
    });
    return course ? toTrainerCourse(course) : undefined;
  },

  async listAllCourses(): Promise<TrainerCourse[]> {
    const courses = await prisma.course.findMany({ include: withStudentsCount });
    return courses.map(toTrainerCourse);
  },

  async approveCourse(id: string): Promise<TrainerCourse | undefined> {
    try {
      const course = await prisma.course.update({
        where: { id },
        data: { status: 'available' },
        include: withStudentsCount,
      });
      return toTrainerCourse(course);
    } catch {
      return undefined;
    }
  },

  async rejectCourse(id: string): Promise<TrainerCourse | undefined> {
    try {
      const course = await prisma.course.update({
        where: { id },
        data: { status: 'rejected' },
        include: withStudentsCount,
      });
      return toTrainerCourse(course);
    } catch {
      return undefined;
    }
  },

  async setCourseVisibility(id: string, isVisible: boolean): Promise<TrainerCourse | undefined> {
    try {
      const course = await prisma.course.update({
        where: { id },
        data: { isVisible },
        include: withStudentsCount,
      });
      return toTrainerCourse(course);
    } catch {
      return undefined;
    }
  },

  async requestCourseDeletion(id: string): Promise<TrainerCourse | undefined> {
    try {
      const course = await prisma.course.update({
        where: { id },
        data: { status: 'pending_deletion' },
        include: withStudentsCount,
      });
      return toTrainerCourse(course);
    } catch {
      return undefined;
    }
  },

  // يُنشئ سجل ملف تعريفي افتراضي لأول مرة (تسمية عامة ثنائية اللغة، لا بيانات وهمية)، ويعيده لاحقاً
  async getProfileExtra(userId: string): Promise<TrainerProfileExtra> {
    const trainer = await prisma.trainer.findUnique({ where: { userId } });
    if (!trainer) {
      return { phone: '', bio: '', specialty: 'Trainer', specialtyAr: 'مدرب', experience: 0 };
    }
    return {
      phone: trainer.phone ?? '',
      bio: trainer.bio ?? '',
      bioAr: trainer.bioAr ?? '',
      specialty: trainer.specialization ?? 'Trainer',
      specialtyAr: trainer.specializationAr ?? 'مدرب',
      experience: trainer.experience,
    };
  },

  async updateProfileExtra(
    userId: string,
    updates: Partial<TrainerProfileExtra>
  ): Promise<TrainerProfileExtra> {
    const data: {
      phone?: string;
      bio?: string;
      bioAr?: string;
      specialization?: string;
      specializationAr?: string;
      experience?: number;
    } = {};
    if (updates.phone !== undefined) data.phone = updates.phone;
    if (updates.bio !== undefined) data.bio = updates.bio;
    if (updates.bioAr !== undefined) data.bioAr = updates.bioAr;
    if (updates.specialty !== undefined) data.specialization = updates.specialty;
    if (updates.specialtyAr !== undefined) data.specializationAr = updates.specialtyAr;
    if (updates.experience !== undefined) data.experience = updates.experience;

    const user = await prisma.user.findUnique({ where: { id: userId } });

    const trainer = await prisma.trainer.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        name: user?.name ?? '',
        email: user?.email ?? '',
        ...data,
      },
    });

    return {
      phone: trainer.phone ?? '',
      bio: trainer.bio ?? '',
      bioAr: trainer.bioAr ?? '',
      specialty: trainer.specialization ?? 'Trainer',
      specialtyAr: trainer.specializationAr ?? 'مدرب',
      experience: trainer.experience,
    };
  },
};
