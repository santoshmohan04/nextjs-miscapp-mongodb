import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getUserFromToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * @swagger
 * /api/authusers/{id}:
 *   put:
 *     summary: Update an existing Auth User
 *     description: Updates the details (name, email, profilePic, password) of an existing AuthUser by ID. Requires authentication.
 *     tags:
 *       - AuthUsers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the AuthUser to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: Password@123
 *               profilePic:
 *                 type: string
 *                 example: https://example.com/avatar.jpg
 *     responses:
 *       201:
 *         description: User updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 67298f9cc63f7f1f90f3b2f2
 *                 name:
 *                   type: string
 *                   example: John Doe
 *                 email:
 *                   type: string
 *                   example: johndoe@example.com
 *                 profilePic:
 *                   type: string
 *                   example: https://example.com/avatar.jpg
 *       400:
 *         description: Missing or invalid ID.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/authusers/{id}:
 *   delete:
 *     summary: Delete an Auth User
 *     description: Deletes an existing AuthUser by ID. Requires authentication.
 *     tags:
 *       - AuthUsers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique ID of the AuthUser to delete.
 *     responses:
 *       200:
 *         description: User deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User deleted successfully
 *       400:
 *         description: Missing ID.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // 🔒 Authenticate user
    const user = await getUserFromToken();
    if (!user || typeof user === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return new NextResponse(JSON.stringify({ message: "Missing id" }), {
        status: 400,
      });
    }

    const body = await req.json();
    const update: any = {
      name: body.name,
      email: body.email,
      profilePic: body.profilePic,
    };

    if (body.password) {
      update.password = await bcrypt.hash(body.password, 10);
    }

    const updated = await AuthUser.findByIdAndUpdate(id, update, {
      new: true,
    }).select("-password");

    if (!updated) {
      return new NextResponse(JSON.stringify({ message: "User not found" }), {
        status: 404,
      });
    }

    return NextResponse.json(updated, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ Connect to DB
    await connectDB();

    // 🔒 Authenticate user via cookie token
    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ message: "Missing id" }, { status: 400 });
    }

    // ✅ Delete user
    const deletedUser = await AuthUser.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("❌ Login error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
