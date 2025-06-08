import { Request } from "express";
import { JwtPayload } from "./auth.middleware"

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
