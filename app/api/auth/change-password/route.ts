import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    await connectDB();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let payload: any;
    try {
      payload = await jwtVerify(token, secret);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "Current and new password required" },
        { status: 400 }
      );
    }

    // Find user by ID from JWT
    const user = await AuthUser.findById(payload.payload.id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
