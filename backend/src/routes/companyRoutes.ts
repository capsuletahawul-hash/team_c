// src/routes/companyRoutes.ts
//
// Maps URL + method -> controller function. All routes here require a
// valid JWT belonging to a Company account (requireAuth + requireRole).

import { Router } from "express";
import { companyController } from "../controllers/companyController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth, requireRole("Company"));

router.get("/tickets", companyController.getTickets);
router.post("/tickets", companyController.createTicket);
router.put("/tickets/:id/status", companyController.updateTicketStatus);

router.get("/employees", companyController.getEmployees);

export default router;
