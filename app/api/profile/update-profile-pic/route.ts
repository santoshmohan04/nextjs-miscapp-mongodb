import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/profile/update-profile-pic:
 *   put:
 *     summary: Update user's profile picture URL
 *     description: Updates the authenticated user's profile picture with a Firebase image URL.
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
 *               - profilepic
 *             properties:
 *               profilepic:
 *                 type: string
 *                 example: "https://firebasestorage.googleapis.com/v0/b/app/o/profilepics%2F123.png?alt=media"
 *     responses:
 *       200:
 *         description: Profile picture updated successfully.
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
 *                     profilepic:
 *                       type: string
 *       400:
 *         description: Invalid input.
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
 *         description: Unauthorized.
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
 *         description: User not found.
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
 *         description: Server error.
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
export async function PUT(req: Request) {
  try {
    await connectDB();

    // Authenticate user (cookie based)
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { profilepic } = await req.json();

    if (!profilepic || typeof profilepic !== "string") {
      return errorResponse(
        "A valid profilepic URL is required",
        400,
        "VALIDATION_ERROR"
      );
    }

    // Update user in DB
    const updatedUser = await AuthUser.findByIdAndUpdate(
      sessionUser._id,
      { profilepic, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return errorResponse("User not found", 404, "USER_NOT_FOUND");
    }

    return successResponse({
      message: "Profile picture updated successfully",
      profilepic: updatedUser.profilepic,
    });
  } catch (err: any) {
    console.error("Update profile pic error:", err);
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}
