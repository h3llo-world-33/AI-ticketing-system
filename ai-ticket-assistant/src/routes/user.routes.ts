import { Router } from "express";
import { updateMyProfile, updatePassword, getUsers, updateUserRole, updateUserSkills } from "../controllers/user.controller";
import { requireUserRole, verifyToken } from "../middlewares/auth.middleware";
import { UserRole } from "../constants/enums";

const router = Router();

// Protected routes - require authentication
router.put("/profile", verifyToken, updateMyProfile);
router.patch("/password", verifyToken, updatePassword);

router.patch("/role", verifyToken, requireUserRole(UserRole.ADMIN), updateUserRole);
router.patch("/skills", verifyToken, requireUserRole(UserRole.ADMIN), updateUserSkills);

router.get("/", verifyToken, requireUserRole(UserRole.ADMIN), getUsers);

export default router;
