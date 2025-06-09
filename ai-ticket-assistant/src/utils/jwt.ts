import jwt from "jsonwebtoken";
import { UserRole } from "../constants/enums";
import { config } from "dotenv";

config();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = "7h";

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export const generateToken = (payload: JwtPayload) => {
  if (!JWT_SECRET) throw new Error("JWT secret is not defined");

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};
