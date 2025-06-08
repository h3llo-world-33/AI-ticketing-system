import { UserRole } from "../constants/enums";

export interface UpdateUserProfileDTO {
  skills?: string[];
  role?: UserRole;
}

export interface UpdatePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UpdatePasswordResponseDTO {
  success: boolean;
  message: string;
}
