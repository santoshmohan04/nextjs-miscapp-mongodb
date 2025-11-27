import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getSessionUser } from "@/lib/auth";

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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profilepic } = await req.json();

    if (!profilepic || typeof profilepic !== "string") {
      return NextResponse.json(
        { error: "A valid profilepic URL is required" },
        { status: 400 }
      );
    }

    // Update user in DB
    const updatedUser = await AuthUser.findByIdAndUpdate(
      sessionUser._id,
      { profilepic, updatedAt: new Date() },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Profile picture updated successfully",
      profilepic: updatedUser.profilepic,
    });
  } catch (err: any) {
    console.error("Update profile pic error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
