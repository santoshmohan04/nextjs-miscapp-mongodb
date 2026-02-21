import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser {
  role: "admin" | "user";
  name: string;
  email: string;
  password: string;
  profilepic?: string;
  avatarKey?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {}

const userSchema = new Schema<IUserDocument>(
  {
    role: { type: String, enum: ["admin", "user"], default: "user" },
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true, select: false },
    profilepic: { type: String },
    avatarKey: { type: String },
  },
  { timestamps: true }
);

// Fixes Turbopack model re-registration
export default (mongoose.models.AuthUser as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>("AuthUser", userSchema);
