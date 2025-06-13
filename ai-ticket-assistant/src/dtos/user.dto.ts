import { UserRole } from "../constants/enums";

export interface UserProfileDTO {
  _id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserProfileDTO {
  name?: string;
  skills?: string[];
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponseDTO {
  success: boolean;
  message: string;
}
