// models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";

/* ---------------------------------------------------------
   1️⃣ TypeScript Interface (Strongly Typed Mongoose Document)
---------------------------------------------------------- */
export interface IUser {
  name: string;
  email: string;
  password?: string;        // optional because we use select:false
  profilepic?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId; // ensures ._id.toString() is valid
}

/* ---------------------------------------------------------
   2️⃣ Mongoose Schema
---------------------------------------------------------- */
const userSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // <— important
    profilepic: { type: String },
  },
  { timestamps: true }
);

/* ---------------------------------------------------------
   3️⃣ Turbopack-safe Model Initialization
---------------------------------------------------------- */
const AuthUser: Model<IUserDocument> =
  (mongoose.models.AuthUser as Model<IUserDocument>) ||
  mongoose.model<IUserDocument>("AuthUser", userSchema);

export default AuthUser;