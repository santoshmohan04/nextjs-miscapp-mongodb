import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";

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

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await AuthUser.create({
      name,
      email,
      password: hashedPassword,
    });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // 🔐 Correct & clean JWT payload
    const token = await new SignJWT({
      id: newUser._id.toString(), // 👍 SAFE — _id is mongoose.Types.ObjectId
      email: newUser.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json(
      {
        message: "User created successfully",
        user: {
          _id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          profilepic: newUser.profilepic || null,
          createdAt: newUser.createdAt,
          updatedAt: newUser.updatedAt,
        },
      },
      { status: 201 }
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error("Signup error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}