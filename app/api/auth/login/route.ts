import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { signToken } from "@/lib/jwt";

/**
 * Login route
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password)
      return NextResponse.json(
        { error: "Email & password required" },
        { status: 400 }
      );

    const user = await AuthUser.findOne({ email }).select("+password");
    if (!user)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const stored = user.password ?? "";
    const match = await bcrypt.compare(password, stored);

    if (!match)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );

    const token = await signToken({ id: user._id.toString() });

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilepic: user.profilepic ?? "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const res = NextResponse.json({ message: "Login success", user: safeUser });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 86400,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
