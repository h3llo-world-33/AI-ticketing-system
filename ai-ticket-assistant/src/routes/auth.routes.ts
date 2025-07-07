import { Router } from "express";
import { signup, login, logout, verifyAuthenticated } from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// Signup - Public
router.post("/signup", signup);

// Login - Public
router.post("/login", login);

// Logout - Protected
router.post("/logout", verifyToken, logout);

router.get("/verify", verifyAuthenticated);

export default router;
