import { Request, Response } from "express";

import { updateStudentProfileSchema } from "../validation/studentValidation.js";
import { userRepository } from "../repositories/userRepository.js";
import { trainerRepository } from "../repositories/trainerRepository.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const studentController = {
  /**
   * Purchased Courses
   */
  async getPurchasedCourses(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const courses = await trainerRepository.listEnrollmentsByStudent(authUser.userId);

      return res.status(200).json(
        courses.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          duration: `${c.durationWeeks} ${c.durationWeeks === 1 ? "Week" : "Weeks"}`,
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
   * and increments the course's student count)
   */
  async purchaseCourse(req: Request, res: Response) {
    try {
      const authUser = (req as AuthenticatedRequest).user!;
      const courseId = Number(req.params.id);
      const course = await trainerRepository.enrollStudent(courseId, authUser.userId);

      if (!course) {
        return res.status(404).json({ success: false, error: "course_not_found" });
      }

      return res.status(200).json({ success: true });
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
