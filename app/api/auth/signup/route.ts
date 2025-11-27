import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { signToken } from "@/lib/jwt";

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new account by storing name, email, and password securely.
 *     tags:
 *       - Authentication
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );

    const exists = await AuthUser.findOne({ email });
    if (exists)
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );

    const hashed = await bcrypt.hash(password, 10);

    const user = await AuthUser.create({
      name,
      email,
      password: hashed,
    });

    const token = await signToken({ id: user._id.toString() });

    const res = NextResponse.json({ message: "Signup successful", user });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 86400,
      path: "/",
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
