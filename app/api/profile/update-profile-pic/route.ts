import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

/**
 * @swagger
 * /api/profile/update-profile-pic:
 *   put:
 *     summary: Update user's profile picture URL
 *     description: Accepts a Firebase Storage download URL and updates the user's profile picture in MongoDB.
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
 *             properties:
 *               profilepic:
 *                 type: string
 *                 description: Firebase Storage image URL
 *                 example: "https://firebasestorage.googleapis.com/v0/b/yourapp/o/profilepics%2F123.png?alt=media"
 *     responses:
 *       200:
 *         description: Profile picture URL updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Profile picture updated successfully"
 *                 profilepic:
 *                   type: string
 *                   description: Updated Firebase URL
 *                   example: "https://firebasestorage.googleapis.com/v0/b/yourapp/o/profilepics%2F123.png?alt=media"
 *       400:
 *         description: Missing or invalid profilepic URL
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

export async function PUT(req: Request) {
  try {
    await connectDB();

    // Authenticate user
    const user = await getUserFromToken();
    if (!user || typeof user === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request JSON
    const { profilepic } = await req.json();

    if (!profilepic || typeof profilepic !== "string") {
      return NextResponse.json(
        { error: "profilepic URL is required and must be a string" },
        { status: 400 }
      );
    }

    // Update user profile picture
    const updatedUser = await AuthUser.findByIdAndUpdate(
      (user as any).id,
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