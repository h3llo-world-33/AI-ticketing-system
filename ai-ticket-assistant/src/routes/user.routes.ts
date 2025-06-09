import { Router } from "express";
import { updateProfile, updatePassword, getUsers, updateRole } from "../controllers/user.controller";
import { requireUserRole, verifyToken } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/enums";

const router = Router();

// Protected routes - require authentication
router.put("/profile", verifyToken, updateProfile);
router.patch("/password", verifyToken, updatePassword);

router.patch("/role", verifyToken, requireUserRole(UserRole.ADMIN), updateRole);
router.get("/", verifyToken, requireUserRole(UserRole.ADMIN), getUsers);

export default router;
