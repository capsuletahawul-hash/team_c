// src/routes/adminRoutes.ts
//
// Maps URL + method -> controller function. All routes here require a
// valid JWT belonging to an Admin account (requireAuth + requireRole).

import { Router } from "express";
import { adminController } from "../controllers/adminController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

// تعديل: ضمان توافق فحص الدور (Role) مع الحرف الكبير والصغير (مثل Admin و admin) لتفادي أي رفض غير مقصود للصلاحيات
router.use(requireAuth, requireRole("Admin", "admin"));
// نهاية تعديل صلاّحية الأدمن

router.get("/stats", adminController.getStats);

// Read-only admin views: current state of the platform.
router.get("/users", adminController.getUsers);
router.get("/orders", adminController.getOrders);
router.get("/enrollments", adminController.getEnrollments);

router.get("/courses", adminController.getCourses);
router.put("/courses/:id/approve", adminController.approveCourse);
router.put("/courses/:id/reject", adminController.rejectCourse);

router.get("/contracts", adminController.getContracts);
router.put("/contracts/:id/approve", adminController.approveContract);
router.put("/contracts/:id/reject", adminController.rejectContract);

router.get("/tickets", adminController.getTickets);
router.put("/tickets/:id/status", adminController.updateTicketStatus);

export default router;