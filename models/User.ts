// models/User.ts
import mongoose, { Schema, Model, Document } from "mongoose";

// 1️⃣ Schema
const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilepic: { type: String },
  },
  { timestamps: true }
);

// 2️⃣ TypeScript interfaces
export interface IUser {
  name: string;
  email: string;
  password: string;
  profilepic?: string;
}

export type IUserDocument = IUser & Document;

// 3️⃣ Turbopack-safe model creation
let AuthUser: Model<IUserDocument>;

if ((mongoose.models as any).AuthUser) {
  // ✅ use runtime 'any' cast to bypass union type
  AuthUser = (mongoose.models as any).AuthUser as Model<IUserDocument>;
} else {
  AuthUser = mongoose.model<IUserDocument>("AuthUser", userSchema);
}

export default AuthUser;