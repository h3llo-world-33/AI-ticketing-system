import { Router } from "express";
import { updateProfile, updatePassword, getUsers } from "../controllers/user.controller";
import { isAdmin, verifyToken } from "../middlewares/auth.middleware";

const router = Router();

// Protected routes - require authentication
router.put("/profile", verifyToken, updateProfile);
router.put("/password", verifyToken, updatePassword);

router.get("/", verifyToken, isAdmin, getUsers);

export default router;
