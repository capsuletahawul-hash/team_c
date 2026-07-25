export interface TrainerCourse {
  id: number;
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

// مصفوفة في الذاكرة تلعب دور قاعدة البيانات مؤقتاً
const courses: TrainerCourse[] = [];
let nextCourseId = 1;

const profileExtras = new Map<string, TrainerProfileExtra>();

// تسجيلات الطلاب بالكورسات (مصفوفة في الذاكرة أيضاً)
interface Enrollment {
  studentId: string;
  courseId: number;
}
const enrollments: Enrollment[] = [];

export const trainerRepository = {
  async listCoursesByTrainer(trainerId: string): Promise<TrainerCourse[]> {
    return courses.filter((course) => course.trainerId === trainerId);
  },

  async createCourse(trainerId: string, data: CreateCourseInput): Promise<TrainerCourse> {
    const course: TrainerCourse = {
      id: nextCourseId++,
      trainerId,
      students: 0,
      rating: 0,
      status: 'coming_soon',
      isVisible: true,
      createdAt: new Date().toISOString(),
      ...data,
    };
    courses.push(course);
    return course;
  },

  async findCourseById(id: number): Promise<TrainerCourse | undefined> {
    return courses.find((course) => course.id === id);
  },

  async listAllCourses(): Promise<TrainerCourse[]> {
    return courses;
  },

  async approveCourse(id: number): Promise<TrainerCourse | undefined> {
    const course = courses.find((c) => c.id === id);
    if (course) course.status = 'available';
    return course;
  },

  async rejectCourse(id: number): Promise<TrainerCourse | undefined> {
    const course = courses.find((c) => c.id === id);
    if (course) course.status = 'rejected';
    return course;
  },

  async setCourseVisibility(id: number, isVisible: boolean): Promise<TrainerCourse | undefined> {
    const course = courses.find((c) => c.id === id);
    if (course) course.isVisible = isVisible;
    return course;
  },

  async requestCourseDeletion(id: number): Promise<TrainerCourse | undefined> {
    const course = courses.find((c) => c.id === id);
    if (course) course.status = 'pending_deletion';
    return course;
  },

  // تسجيل طالب بكورس (بعد إتمام الدفع) — يزيد عدد الطلاب مرة وحدة فقط لكل طالب/كورس
  async enrollStudent(courseId: number, studentId: string): Promise<TrainerCourse | undefined> {
    const course = courses.find((c) => c.id === courseId);
    if (!course) return undefined;

    const alreadyEnrolled = enrollments.some(
      (e) => e.courseId === courseId && e.studentId === studentId
    );

    if (!alreadyEnrolled) {
      enrollments.push({ courseId, studentId });
      course.students += 1;
    }

    return course;
  },

  async listEnrollmentsByStudent(studentId: string): Promise<TrainerCourse[]> {
    const courseIds = enrollments
      .filter((e) => e.studentId === studentId)
      .map((e) => e.courseId);

    return courses.filter((c) => courseIds.includes(c.id));
  },

  // يُنشئ سجل ملف تعريفي افتراضي لأول مرة (تسمية عامة ثنائية اللغة، لا بيانات وهمية)، ويعيده لاحقاً
  async getProfileExtra(trainerId: string): Promise<TrainerProfileExtra> {
    let extra = profileExtras.get(trainerId);
    if (!extra) {
      extra = { phone: '', bio: '', specialty: 'Trainer', specialtyAr: 'مدرب', experience: 0 };
      profileExtras.set(trainerId, extra);
    }
    return extra;
  },

  async updateProfileExtra(
    trainerId: string,
    updates: Partial<TrainerProfileExtra>
  ): Promise<TrainerProfileExtra> {
    const current = await this.getProfileExtra(trainerId);
    const updated = { ...current, ...updates };
    profileExtras.set(trainerId, updated);
    return updated;
  },
};
