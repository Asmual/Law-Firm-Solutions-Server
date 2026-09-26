import { Router } from "express";
import {
  getCases,
  getCaseById,
  createCase,
  updateCase,
  addStatusUpdate,
  deleteCase,
} from "../controllers/case.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getCases);
router.post("/", authorize("admin", "advocate"), createCase);
router.get("/:id", getCaseById);
router.put("/:id", authorize("admin", "advocate"), updateCase);
router.post("/:id/status", addStatusUpdate);
router.delete("/:id", authorize("admin"), deleteCase);

export default router;
