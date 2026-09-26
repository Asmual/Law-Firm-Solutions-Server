import { Router } from "express";
import { login, register, getMe, refreshToken, logout } from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.post("/refresh-token", refreshToken);
router.get("/me", authenticate, getMe);
router.post("/logout", authenticate, logout);

export default router;
