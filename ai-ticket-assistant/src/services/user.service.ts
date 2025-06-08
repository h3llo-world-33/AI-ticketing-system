import User from "../models/user.model";
import { LoginRequestDTO, SignupRequestDTO } from "../dtos/auth.dto";
import { comparePasswords, hashPassword } from "../utils/hash";
import { inngest } from "../inngest/client";
import { generateToken } from "../utils/jwt";


export const registerUser = async (data: SignupRequestDTO) => {
  const { name, email, password, skills = [] } = data;

  const existing = await User.findOne({ email });
  if (existing) throw new Error("Email already in use");

  const hashedPassword = await hashPassword(password);
  const newUser = await User.create({ name, email, password: hashedPassword, skills });

  // Send event to Inngest
  await inngest.send({
    name: "user/signup",
    data: {
      email: newUser.email,
    },
  });

  const token = generateToken({
    id: newUser._id.toString(),
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
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  });

  return token;
}
