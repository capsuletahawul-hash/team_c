import { Request, Response } from "express";

import { updateStudentProfileSchema } from "../validation/studentValidation.js";
import { userRepository } from "../repositories/userRepository.js";
import { enrollmentRepository } from "../repositories/enrollmentRepository.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const studentController = {
  /**
   * Purchased Courses
   */
  async getPurchasedCourses(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const enrollments = await enrollmentRepository.findByUserId(authUser.userId);

      return res.status(200).json(
        enrollments.map((e: (typeof enrollments)[number]) => ({
          id: e.course.id,
          title: e.course.title,
          category: e.course.category,
          duration: `${e.course.durationWeeks} ${e.course.durationWeeks === 1 ? "Week" : "Weeks"}`,
          progress: 0,
          status: "Active" as const,
        }))
      );
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Purchase Course (called after successful checkout — records enrollment
   * and decrements the course's available seats)
   */
  async purchaseCourse(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const courseId = String(req.params.id);
      await enrollmentRepository.create(authUser.userId, courseId);

      return res.status(200).json({ success: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";

      if (message === "Course not found") {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }
      if (message === "No available seats left in this course") {
        return res.status(400).json({ success: false, error: "no_seats_left" });
      }

      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * Update Profile
   */
  async updateProfile(req: Request, res: Response) {
    try {
      const validation = updateStudentProfileSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: validation.error.flatten().fieldErrors,
        });
      }

      const authUser = (req as AuthenticatedRequest).user!;
      const { fullName, avatar } = validation.data;

      const updated = await userRepository.updateProfile(authUser.userId, {
        name: fullName,
        avatar,
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: "user_not_found" });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: updated.id,
          fullName: updated.name,
          email: updated.email,
          role: updated.role,
          avatar: updated.avatar,
          joinedAt: updated.createdAt,
          completedCourses: 0,
          activeCourses: 0,
          companyAffiliation: "",
        },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },
};
