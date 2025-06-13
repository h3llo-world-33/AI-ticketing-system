import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { UpdatePasswordDTO, UpdateUserProfileDTO } from "../dtos/user.dto";
import { ResponseDTO } from "../dtos/common.dto";
import { UserRole } from "../constants/enums";


export const getUsers = async (
  req: Request,
  res: Response<ResponseDTO>
) => {
  try {
    const users = await userService.getAllUsers();

    res.status(200).json({
      success: true,
      message: "Fetched all users",
      data: users
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error: error.message,
    })
  }
}


export const updateMyProfile = async (
  req: Request,
  res: Response<ResponseDTO>
) => {
  const { user } = req;
  try {
    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
      return;
    }

    const updatedUser = await userService.updateProfile(
      user.id,
      req.body as UpdateUserProfileDTO
    );

    console.log({ updatedUser });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};


export const updatePassword = async (
  req: Request,
  res: Response<ResponseDTO>
) => {
  const { user } = req;
  try {
    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
      return;
    }

    await userService.updatePassword(
      user.id,
      req.body as UpdatePasswordDTO
    );

    res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update password",
      error: error.message,
    });
  }
};


// Controller for admin to update user skills
export const updateUserRole = async (
  req: Request,
  res: Response<ResponseDTO>
) => {
  const { user } = req;
  try {
    if (!user?.id || user.role !== UserRole.ADMIN) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
      return;
    }

    const { userId, role } = req.body;
    if (!userId || !role) {
      res.status(400).json({
        success: false,
        message: "User ID and role are required"
      });
      return;
    }

    const newRole = role as UserRole;
    const updatedResult = await userService.updateRole(userId, newRole);

    if (!updatedResult) {
      res.status(400).json({
        success: false,
        message: "User role update failed or remains the same"
      });
    } else {
      res.status(200).json({
        success: true,
        message: "User role updated successfully"
      });
    }

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update role of the user",
      error: error.message,
    });
  }
};


// Controller for admin to update user skills
export const getUserProfile = async (
  req: Request,
  res: Response<ResponseDTO>
) => {
  try {
    const { id } = req.params;
    const { user } = req;
    
    // Only allow users to access their own profile or admins to access any profile
    if (!user?.id || (user.id !== id && user.role !== UserRole.ADMIN)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission to access this profile"
      });
      return;
    }

    const userData = await userService.getUserById(id);
    
    res.status(200).json({
      success: true,
      message: "User profile retrieved successfully",
      data: userData
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile",
      error: error.message,
    });
  }
};

export const updateUserSkills = async (
  req: Request,
  res: Response<ResponseDTO>
) => {
  const { user } = req;
  try {
    if (!user?.id || user.role !== UserRole.ADMIN) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
      return;
    }

    const { userId, skills } = req.body;
    if (!userId || !skills) {
      res.status(400).json({
        success: false,
        message: "User ID and skills are required"
      });
      return;
    }

    const updatedUser = await userService.updateSkills(userId, skills);

    res.status(200).json({
      success: true,
      message: "User skills updated successfully",
      data: updatedUser
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to update user skills",
      error: error.message,
    });
  }
};
