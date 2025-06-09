import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { UpdatePasswordDTO, UpdateUserProfileDTO } from "../dtos/user.dto";
import { AuthenticatedRequest } from "../types/custom";
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


export const updateProfile = async (
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

    const updatedUser = await userService.updateUserProfile(
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


export const updateRole = async (
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

    const newRole = req.body.role as UserRole;
    if (user.role === newRole) {
      res.status(400).json({
        success: false,
        message: "Provide different role than the present one"
      })
      return;
    }

    const updatedResult = await userService.updateUserRole(user.id, newRole);

    if (!updatedResult) {
      res.status(400).json({
        success: false,
        message: "User role remains same as previous"
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
