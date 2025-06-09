import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../utils/jwt";
import { UserRole } from "../constants/enums";

const JWT_SECRET = process.env.JWT_SECRET as string;


export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Unauthorized: No token provided" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Unauthorized: Invalid token" });
  }
};


export const requireUserRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    // First check if user is authenticated
    if (!user?.id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Authentication required"
      });
      return;
    }

    if (!user || !allowedRoles.includes(user.role)) {
      res.status(403).json({
        success: false,
        message: "Forbidden: You don't have permission",
      });
    }

    next();
  };
};
