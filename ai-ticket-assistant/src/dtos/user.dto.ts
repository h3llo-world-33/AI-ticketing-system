import { UserRole } from "../constants/enums";

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
