import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getUserFromToken } from "@/lib/auth";

/**
 * @swagger
 * /api/profile/upload:
 *   post:
 *     summary: Upload or update a user's profile picture
 *     description: Accepts an image file, converts it to Base64, stores it in MongoDB, and returns the updated user object.
 *     tags:
 *       - Profile
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Profile picture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Profile picture updated successfully
 *                 profilepic:
 *                   type: string
 *                   format: byte
 *                   example: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABVY..."
 *       400:
 *         description: Invalid or missing file
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔒 Authenticate user
    const user = await getUserFromToken();
    if (!user || typeof user === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse uploaded form data
    const data = await req.formData();
    const file = data.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files allowed" }, { status: 400 });
    }

    // Convert to Base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Update in MongoDB
    const updatedUser = await AuthUser.findByIdAndUpdate(
      (user as any).id,
      { profilepic: base64Image, updatedAt: new Date() },
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
    console.error("Upload error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}