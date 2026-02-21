import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/profile/avatar:
 *   put:
 *     summary: Update user's avatar
 *     description: Updates the authenticated user's avatar with a SVG avatar key.
 *     tags:
 *       - Profile
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatarKey
 *             properties:
 *               avatarKey:
 *                 type: string
 *                 example: "avatar-1"
 *     responses:
 *       200:
 *         description: Avatar updated successfully.
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
 *                     avatarKey:
 *                       type: string
 *       400:
 *         description: Invalid input.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
export async function PUT(req: Request) {
  try {
    await connectDB();

    // Authenticate user (cookie based)
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { avatarKey } = await req.json();

    if (!avatarKey || typeof avatarKey !== "string") {
      return errorResponse(
        "A valid avatarKey is required",
        400,
        "VALIDATION_ERROR"
      );
    }

    // Validate avatarKey format (e.g., "avatar-1", "avatar-2", etc.)
    if (!avatarKey.match(/^avatar-\d+$/)) {
      return errorResponse("Invalid avatar key format", 400, "VALIDATION_ERROR");
    }

    // Update user in DB
    const updatedUser = await AuthUser.findByIdAndUpdate(
      sessionUser._id,
      { avatarKey, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return errorResponse("User not found", 404, "USER_NOT_FOUND");
    }

    return successResponse({
      message: "Avatar updated successfully",
      avatarKey: updatedUser.avatarKey,
    });
  } catch (err: any) {
    console.error("Update avatar error:", err);
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}
