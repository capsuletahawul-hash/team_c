import { Router } from "express";
import { trainerController } from "../controllers/trainerController.js";

const router = Router();

/**
 * Public Courses
 * Accessible by everyone (Students, Guests, etc.)
 */
router.get("/public", trainerController.getPublicCourses);
router.get("/public/:id", trainerController.getPublicCourseById);

export default router;