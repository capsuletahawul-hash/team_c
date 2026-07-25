// src/routes/studentRoutes.ts
//
// Maps URL + method -> controller function. All routes here require a
// valid JWT belonging to a Student account (requireAuth + requireRole).

import { Router } from "express";
import { studentController } from "../controllers/studentController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);

// مسموح للمدرب كمان يستخدم نفس مسارَي الشراء والكورسات المسجّلة، عشان يقدر يتعلم هو بعد
router.get("/courses/purchased", requireRole("Student", "Trainer"), studentController.getPurchasedCourses);
router.post("/courses/:id/purchase", requireRole("Student", "Trainer"), studentController.purchaseCourse);

router.put("/profile/update", requireRole("Student"), studentController.updateProfile);

export default router;
