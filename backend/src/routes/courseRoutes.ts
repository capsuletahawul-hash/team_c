import { Router } from "express";
import { trainerController } from "../controllers/trainerController.js";
import { courseContentController } from "../controllers/courseContentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireActiveAccess } from "../middleware/accessMiddleware.js";

const router = Router();

/**
 * Public Courses
 * Accessible by everyone (Students, Guests, etc.)
 */
router.get("/public", trainerController.getPublicCourses);
router.get("/public/:id", trainerController.getPublicCourseById);

/**
 * FIX: this is the first route in the codebase that actually enforces
 * time-limited access. requireAuth identifies the user; requireActiveAccess
 * (accessMiddleware.ts) checks their Enrollment window on every request and
 * returns 403 { success:false, error:"access_expired" } if it's not active.
 */
router.get(
  "/:courseId/content",
  requireAuth,
  requireActiveAccess,
  courseContentController.getContent
);

export default router;