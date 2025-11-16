import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";

/**
 * Login route
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 }
      );
    }

    // Fetch user with password
    const user = await AuthUser.findOne({ email }).select("+password");

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // TS-safe password check
    const storedHash = user.password ?? "";
    if (!storedHash) {
      return NextResponse.json(
        { error: "User password not found" },
        { status: 500 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, storedHash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // JWT signing
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({
      id: user._id.toString(),
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(secret);

    // Convert values safely
    const safeUser = {
      id: user._id?.toString() ?? "",
      name: user.name,
      email: user.email,
      profilepic: user.profilepic ?? "",
      createdAt: user.createdAt ?? null,
      updatedAt: user.updatedAt ?? null,
    };

    const response = NextResponse.json({
      message: "Login successful",
      user: safeUser,
    });

    // Cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}