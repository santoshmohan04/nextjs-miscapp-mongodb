import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * @swagger
 * /api/profile/change-password:
 *   post:
 *     summary: Change user password
 *     description: Allows authenticated users to change their password by providing the current and new one.
 *     tags:
 *       - Profile
 *     security:
 *       - cookieAuth: []
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 🔐 Verify JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let payload: any;

    try {
      payload = await jwtVerify(token, secret);
    } catch (e) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // 📩 Parse request body
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { error: "All password fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { error: "New password & confirm password do not match" },
        { status: 400 }
      );
    }

    // 🚨 Additional security validation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // 👤 Fetch user
    const user = await AuthUser.findById(payload.payload.id).select("+password");

    if (!user) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // ⚠ TS Safety: Make sure password exists
    const storedHash = user.password ?? "";
    if (!storedHash) {
      return NextResponse.json(
        { error: "User password record is missing" },
        { status: 500 }
      );
    }

    // 🔑 Validate current password
    const isPasswordValid = await bcrypt.compare(currentPassword, storedHash);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401 }
      );
    }

    // 🔐 Hash new password (use cost factor 12 for security)
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // 💾 Save updated user
    await AuthUser.findByIdAndUpdate(
      user._id,
      { password: hashedPassword, updatedAt: new Date() },
      { new: true }
    );

    return NextResponse.json({
      message: "Password updated successfully",
    });
  } catch (err: any) {
    console.error("Change-password error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}