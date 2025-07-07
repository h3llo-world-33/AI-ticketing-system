import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../utils/jwt";
import * as userService from "../services/user.service";
import { LoginRequestDTO, LoginResponseDTO, SignupRequestDTO, SignupResponseDTO } from "../dtos/auth.dto";


export const signup = async (
  req: Request<{}, {}, SignupRequestDTO>,
  res: Response<SignupResponseDTO>
) => {
  try {
    const authToken = await userService.registerUser(req.body);
    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
      success: true,
      message: "User registered successfully",
      token: authToken,
    });

  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Signup failed",
      token: null,
    });
  }
};


export const login = async (
  req: Request<{}, {}, LoginRequestDTO>,
  res: Response<LoginResponseDTO>
) => {
  try {
    const authToken = await userService.authenticateUser(req.body);
    res.cookie("token", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 60 * 60 * 1000 // 7 days
    });
    res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token: authToken,
    });

  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message || "Login failed",
      token: null,
    });
  }
};


export const logout = async (_req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/", // Ensure the path matches where the cookie was set
    });

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Logout failed"
    });
  }
};


export const verifyAuthenticated = async (req: Request, res: Response) => {
  // Check both cookie and Authorization header
  let token = req.cookies.token;
  
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
  }

  if (!token) {
    res.status(401).json({ authenticated: false });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const userData = await userService.getUserById(decoded.id);
    
    res.status(200).json({
      authenticated: true,
      user: {
        ...userData,
        id: decoded.id
      }
    });
  } catch (err) {
    res.status(401).json({ authenticated: false });
  }
};