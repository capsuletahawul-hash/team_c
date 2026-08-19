// src/routes/contractRoutes.ts
//
// Maps URL + method -> controller function. Public — no auth, matches
// contactRoutes.ts (the person filling this out doesn't have an account yet).

import { Router } from "express";
import { contractController } from "../controllers/contractController.js";

const router = Router();

router.post("/", contractController.submitContract);

export default router;
