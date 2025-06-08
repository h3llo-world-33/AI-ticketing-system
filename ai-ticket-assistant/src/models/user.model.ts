import mongoose, { Schema } from "mongoose";
import { UserRole } from "../constants/enums";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  skills?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.USER,
  },
  skills: [{ type: String }],
},
{ timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
