import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { UpdatePasswordDTO, UpdateUserProfileDTO } from "../dtos/user.dto";
import { AuthenticatedRequest } from "../types/custom";
import { ResponseDTO } from "../dtos/common.dto";


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
  const { user } = req as AuthenticatedRequest;
  try {
    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
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
  const { user } = req as AuthenticatedRequest;
  try {
    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized Access"
      });
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
