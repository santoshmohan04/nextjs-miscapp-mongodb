import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { errorResponse, successResponse } from "@/lib/api-response";

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
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *       401:
 *         description: Unauthorized or invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return errorResponse("Not authenticated", 401, "UNAUTHORIZED");
    }

    // 🔐 Verify JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    let payload: any;

    try {
      payload = await jwtVerify(token, secret);
    } catch (e) {
      return errorResponse("Invalid or expired token", 401, "INVALID_TOKEN");
    }

    // 📩 Parse request body
    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return errorResponse(
        "All password fields are required",
        400,
        "VALIDATION_ERROR"
      );
    }

    if (newPassword !== confirmPassword) {
      return errorResponse(
        "New password & confirm password do not match",
        400,
        "VALIDATION_ERROR"
      );
    }

    // 🚨 Additional security validation
    if (newPassword.length < 8) {
      return errorResponse(
        "Password must be at least 8 characters long",
        400,
        "WEAK_PASSWORD"
      );
    }

    // 👤 Fetch user
    const user = await AuthUser.findById(payload.payload.id).select("+password");

    if (!user) {
      return errorResponse("User account not found", 404, "USER_NOT_FOUND");
    }

    // ⚠ TS Safety: Make sure password exists
    const storedHash = user.password ?? "";
    if (!storedHash) {
      return errorResponse(
        "User password record is missing",
        500,
        "PASSWORD_RECORD_MISSING"
      );
    }

    // 🔑 Validate current password
    const isPasswordValid = await bcrypt.compare(currentPassword, storedHash);

    if (!isPasswordValid) {
      return errorResponse(
        "Current password is incorrect",
        401,
        "INVALID_CREDENTIALS"
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

    return successResponse({ message: "Password updated successfully" });
  } catch (err: any) {
    console.error("Change-password error:", err);
    return errorResponse("Internal server error", 500, "INTERNAL_SERVER_ERROR");
  }
}