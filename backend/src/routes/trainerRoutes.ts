// src/routes/trainerRoutes.ts
//
// Maps URL + method -> controller function. All routes here require a
// valid JWT belonging to a Trainer account (requireAuth + requireRole).

import { Router } from "express";
import { trainerController } from "../controllers/trainerController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/public/:trainerId", trainerController.getTrainerById);
router.use(requireAuth, requireRole("Trainer"));

router.get("/profile", trainerController.getProfile);
router.put("/profile", trainerController.updateProfile);

router.get("/courses", trainerController.getCourses);
router.post("/courses", trainerController.createCourse);
router.put("/courses/:id/visibility", trainerController.updateVisibility);
router.post("/courses/:id/deletion-request", trainerController.requestDeletion);

router.get("/students-progress", trainerController.getStudentsProgress);

export default router;
