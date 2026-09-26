import { Router } from "express";
import {
  getUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  updateProfile,
} from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", getUsers);
router.put("/profile", updateProfile);
router.get("/:id", getUserById);
router.patch("/:id/role", authorize("admin"), updateUserRole);
router.patch("/:id/status", authorize("admin"), toggleUserStatus);

export default router;
