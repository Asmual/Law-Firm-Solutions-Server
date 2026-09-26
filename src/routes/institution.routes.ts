import { Router } from "express";
import {
  getInstitutions,
  getInstitutionById,
  createInstitution,
  updateInstitution,
  deleteInstitution,
} from "../controllers/institution.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getInstitutions);
router.get("/:id", getInstitutionById);
router.post("/", authorize("admin", "advocate"), createInstitution);
router.put("/:id", authorize("admin", "advocate"), updateInstitution);
router.delete("/:id", authorize("admin"), deleteInstitution);

export default router;
