import { ObjectId } from "mongoose";
import User from "../models/user.model";
import { LoginRequestDTO, SignupRequestDTO } from "../dtos/auth.dto";
import { comparePasswords, hashPassword } from "../utils/hash";
import { inngest } from "../inngest/client";
import { generateToken } from "../utils/jwt";
import { UserRole } from "../constants/enums";
import { UpdatePasswordDTO, UpdateUserProfileDTO } from "../dtos/user.dto";


export const registerUser = async (data: SignupRequestDTO) => {
  const { name, email, password, skills = [] } = data;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already in use");

  const hashedPassword = await hashPassword(password);
  const newUser = await User.create({ name, email, password: hashedPassword, skills });

  if (!newUser) {
    throw new Error("User registration failed");
  }

  // Send event to Inngest
  await inngest.send({
    name: "user/signup",
    data: {
      email: newUser.email,
    },
  });

  const token = generateToken({
    id: (newUser._id as ObjectId).toString(),
    email: newUser.email,
    role: newUser.role,
  });

  return token;
};


export const authenticateUser = async (data: LoginRequestDTO) => {
  const { email, password } = data;

  const user = await User.findOne({ email });
  if (!user) throw new Error("User not found");

  const isPasswordCorrect = await comparePasswords(password, user.password);
  if (!isPasswordCorrect) {
    throw new Error("Invalid credentials");
  }

  const token = generateToken({
    id: (user._id as ObjectId).toString(),
    email: user.email,
    role: user.role,
  });

  return token;
}


export const getAllUsers = async () => {
  const users = await User.find()
    .select("-password")
    .sort({ createdAt: -1 });

  // Map to a consistent format with only necessary fields
  return users.map(user => ({
    name: user.name,
    email: user.email,
    role: user.role,
    skills: user.skills || [],
    createdAt: user.createdAt
  }));
}


export const updateUserProfile = async (userId: string, data: UpdateUserProfileDTO) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  // Update only the fields that are provided
  if (data.skills !== undefined) {
    user.skills = data.skills;
  }

  if (data.role !== undefined) {
    // Optional: Add role validation if needed
    if (!Object.values(UserRole).includes(data.role)) {
      throw new Error("Invalid role");
    }
    user.role = data.role;
  }

  await user.save();

  return {
    email: user.email,
    role: user.role,
    skills: user.skills || []
  };
};


export const updatePassword = async (userId: string, data: UpdatePasswordDTO) => {
  const { currentPassword, newPassword } = data;

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const isPasswordCorrect = await comparePasswords(currentPassword, user.password);
  if (!isPasswordCorrect) {
    throw new Error("Current password is incorrect");
  }

  // Hash and update new password
  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  return true;
};
