import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { ObjectId } from "mongoose";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const existingUser = await AuthUser.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await AuthUser.create({ name, email, password: hashedPassword });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // Create JWT Token
    const token = await new SignJWT({ id: (newUser._id as ObjectId).toString(), email: newUser.email })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    const response = NextResponse.json(
      { message: "User created successfully", user: newUser },
      { status: 201 }
    );

    // Set HttpOnly cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}