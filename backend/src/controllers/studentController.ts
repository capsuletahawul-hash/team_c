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

      const now = new Date();

return res.status(200).json(
  enrollments.map((e: (typeof enrollments)[number]) => ({
    id: e.course.id,
    title: e.course.title,
    category: e.course.category,
    duration: `${e.course.durationWeeks} ${
      e.course.durationWeeks === 1 ? "Week" : "Weeks"
    }`,
    progress: 0,
    accessStartsAt: e.accessStartsAt,
    accessEndsAt: e.accessEndsAt,
    status:
      e.accessStartsAt <= now && now <= e.accessEndsAt
        ? "Active"
        : "Locked",
  }))
);

    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, error: "internal_server_error" });
    }
  },

  /**
   * FIX: This endpoint used to call enrollmentRepository.create(userId, courseId)
   * directly — granting a student unlimited, dateless access to any course with
   * zero payment, zero order, and zero verification. That's the exact
   * "Order created -> Enrollment" anti-pattern the Week 5 handbook calls out as
   * WRONG (Chapter 02). Real access must always go:
   *   POST /api/orders  ->  Moyasar checkout  ->  verify  ->  accessService.grantAccess
   *
   * Rather than silently delete the route (which could 404 something the
   * frontend still calls), it now fails loudly and points callers at the real
   * flow, so nobody accidentally ships free access again.
   */
  async purchaseCourse(req: Request, res: Response) {
    return res.status(410).json({
      success: false,
      error: "endpoint_removed",
      message:
        "Direct enrollment is no longer supported. Create an order via POST /api/orders, " +
        "complete the Moyasar sandbox checkout, and access is granted automatically once " +
        "the payment is verified.",
    });
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