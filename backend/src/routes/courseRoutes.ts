import { Router } from "express";
import { trainerController } from "../controllers/trainerController.js";
import { courseContentController } from "../controllers/courseContentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireActiveAccess } from "../middleware/accessMiddleware.js";

const router = Router();

/**
 * Public Courses
 * يدعم كلاً من / و /public لتجنب خطأ 404
 */
router.get("/", trainerController.getPublicCourses);
router.get("/public", trainerController.getPublicCourses);
router.get("/public/:id", trainerController.getPublicCourseById);

/**
 * Time-limited course content access
 */
router.get(
  "/:courseId/content",
  requireAuth,
  requireActiveAccess,
  courseContentController.getContent
);

export default router;