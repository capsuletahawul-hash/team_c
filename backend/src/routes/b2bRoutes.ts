import { Router } from "express";
import { b2bController } from "../controllers/b2bController.js";

const router = Router();

router.post("/", b2bController.submitRequest);
router.get("/", b2bController.getRequests);
router.get("/:id", b2bController.getRequestById);

export default router;