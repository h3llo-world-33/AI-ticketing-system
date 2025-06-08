export interface SignupRequestDTO {
  name: string;
  email: string;
  password: string;
  skills?: string[]; // optional
}

export interface SignupResponseDTO {
  success: boolean;
  message: string;
  token: string | null;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO extends SignupResponseDTO {}
