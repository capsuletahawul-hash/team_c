// src/routes/authRoutes.ts
//
// Maps URL + method -> controller function. Nothing else lives here
// (Handbook Section 04.3). Middleware order matters (Section 2.4/2.5) —
// authLimiter and requireAuth must run BEFORE the controller for the
// routes that need them.

import { Router } from "express";
import { authController } from "../controllers/authController.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.post("/forgot-password", authLimiter, authController.forgotPassword);

// Protected route — requires a valid, verified JWT. Exists so the Postman
// test table's "Protected route (any)" requirement (Handbook Section 11)
// has a real endpoint to test against.
router.get("/me", requireAuth, authController.me);

export default router;