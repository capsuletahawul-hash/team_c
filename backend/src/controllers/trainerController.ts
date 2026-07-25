import { Request, Response } from "express";

import { createCourseSchema, updateProfileSchema } from "../validation/trainerValidation.js";
import { trainerRepository, TrainerCourse, TrainerProfileExtra } from "../repositories/trainerRepository.js";
import { userRepository } from "../repositories/userRepository.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

// يحول سجل الدورة الداخلي إلى الشكل اللي تتوقعه لوحة تحكم المدرب بالواجهة
function toCourseItem(course: TrainerCourse, trainerName: string) {
  return {
    id: course.id,
    title: course.title,
    category: course.category,
    description: course.description,
    subtitle: course.description,
    instructor: trainerName,
    trainerId: course.trainerId,
    price: course.price,
    originalPrice: course.price,
    discount: null,
    duration: `${course.durationWeeks} ${course.durationWeeks === 1 ? "Week" : "Weeks"}`,
    level: course.level,
    language: "Arabic / English",
    updated: course.createdAt.slice(0, 7),
    rating: course.rating,
    status: course.status,
    students: course.students,
    thumbnail: "default.jpg",
    isVisible: course.isVisible,
  };
}

export const trainerController = {
  /**
   * Get Profile
   */
  async getProfile(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const user = await userRepository.findById(authUser.userId);

      if (!user) {
        return res.status(404).json({ success: false, error: "trainer_not_found" });
      }

      const [courses, extra] = await Promise.all([
        trainerRepository.listCoursesByTrainer(authUser.userId),
        trainerRepository.getProfileExtra(authUser.userId),
      ]);

      const totalStudents = courses.reduce((sum, c) => sum + c.students, 0);
      const ratedCourses = courses.filter((c) => c.rating > 0);
      const avgRating = ratedCourses.length
        ? +(ratedCourses.reduce((sum, c) => sum + c.rating, 0) / ratedCourses.length).toFixed(1)
        : 0;

      return res.status(200).json({
        success: true,
        data: {
          trainerId: user.id,
          name: user.name,
          specialty: extra.specialty,
          specialtyAr: extra.specialtyAr,
          bio: extra.bio,
          bioAr: extra.bioAr,
          email: user.email,
          phone: extra.phone,
          experience: extra.experience,
          avatarLetter: user.name.charAt(0).toUpperCase(),
          stats: {
            coursesCount: courses.length,
            studentsCount: totalStudents,
            rating: avgRating,
          },
          courses: courses.map((c) => ({
            id: c.id,
            name: c.title,
            students: c.students,
            status: c.status === "available" ? "published" : "review",
          })),
          reviews: [],
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Update Profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const validation = updateProfileSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      const authUser = (req as AuthenticatedRequest).user!;
      const { fullName, specialization, bio, experienceVal } = validation.data;

      if (fullName) {
        await userRepository.updateName(authUser.userId, fullName);
      }

      // ما فيه ترجمة حقيقية للتخصص/النبذة — نحط نفس النص بالحقلين العربي والإنجليزي
      // عشان ما تطلع قيمة افتراضية قديمة (زي "مدرب") بدل تعديل المستخدم عند تبديل اللغة
      const extraUpdates: Partial<TrainerProfileExtra> = {};
      if (specialization !== undefined) {
        extraUpdates.specialty = specialization;
        extraUpdates.specialtyAr = specialization;
      }
      if (bio !== undefined) {
        extraUpdates.bio = bio;
        extraUpdates.bioAr = bio;
      }
      if (experienceVal !== undefined) extraUpdates.experience = experienceVal;

      await trainerRepository.updateProfileExtra(authUser.userId, extraUpdates);

      return res.status(200).json({ success: true });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * List Courses
   */
  async getCourses(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const user = await userRepository.findById(authUser.userId);
      const courses = await trainerRepository.listCoursesByTrainer(authUser.userId);

      return res.status(200).json({
        success: true,
        courses: courses.map((c) => toCourseItem(c, user?.name || "")),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Create Course
   */
  async createCourse(req: Request, res: Response) {
    try {
      const validation = createCourseSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      const authUser = (req as AuthenticatedRequest).user!;
      const user = await userRepository.findById(authUser.userId);
      const course = await trainerRepository.createCourse(authUser.userId, validation.data);

      return res.status(201).json({
        success: true,
        ticketId: course.id,
        course: toCourseItem(course, user?.name || ""),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Update Course Visibility
   */
  async updateVisibility(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const courseId = Number(req.params.id);
      const course = await trainerRepository.findCourseById(courseId);

      if (!course || course.trainerId !== authUser.userId) {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      const updated = await trainerRepository.setCourseVisibility(
        courseId,
        Boolean(req.body?.isVisible)
      );

      return res.status(200).json({ success: true, course: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Request Course Deletion
   */
  async requestDeletion(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const courseId = Number(req.params.id);
      const course = await trainerRepository.findCourseById(courseId);

      if (!course || course.trainerId !== authUser.userId) {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      const updated = await trainerRepository.requestCourseDeletion(courseId);
      return res.status(200).json({ success: true, course: updated });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Students Progress (no enrollment system yet — returns an empty list)
   */
  async getStudentsProgress(_req: Request, res: Response) {
    return res.status(200).json([]);
  },



  /**
 * Public Courses
 * Returns all published & visible courses for students
 */
async getPublicCourses(_req: Request, res: Response) {
  try {
    const courses = await trainerRepository.listAllCourses();

    const publicCourses = courses.filter(
      (course) =>
        course.isVisible === true &&
        course.status === "available"
    );

    // نجيب اسم كل مدرب مرة وحدة بس (كاش بسيط) بدل ما نكرر البحث لكل كورس
    const trainerNames = new Map<string, string>();
    for (const course of publicCourses) {
      if (!trainerNames.has(course.trainerId)) {
        const trainer = await userRepository.findById(course.trainerId);
        trainerNames.set(course.trainerId, trainer?.name || "");
      }
    }

    return res.status(200).json({
      success: true,
      courses: publicCourses.map((course) => ({
        ...course,
        instructor: trainerNames.get(course.trainerId) || "",
        duration: Math.round(course.videoDurationMinutes / 60),
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: "internal_server_error",
    });
  }
},

  /**
   * Public Course Details
   * Returns a single published & visible course, enriched with the trainer's name
   */
  async getPublicCourseById(req: Request, res: Response) {
    try {
      const courseId = Number(req.params.id);
      const course = await trainerRepository.findCourseById(courseId);

      if (!course || course.isVisible !== true || course.status !== "available") {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      const trainer = await userRepository.findById(course.trainerId);

      return res.status(200).json({
        success: true,
        course: toCourseItem(course, trainer?.name || ""),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },
};
