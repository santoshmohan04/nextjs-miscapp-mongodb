import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getSessionUser } from "@/lib/auth";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

/**
 * @swagger
 * /api/authusers/{id}:
 *   put:
 *     summary: Update an existing Auth User
 *     description: Updates name, email, profilepic, or password of an AuthUser by ID.
 *     tags:
 *       - AuthUsers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: User updated successfully.
 *       400:
 *         description: Invalid ID or missing fields.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
export async function PUT(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    // Authenticate
    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();

    const update: any = {
      name: body.name,
      email: body.email,
      profilepic: body.profilepic,
      updatedAt: new Date(),
    };

    // Hash password if provided
    if (body.password) {
      update.password = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await AuthUser.findByIdAndUpdate(id, update, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/authusers/{id}:
 *   delete:
 *     summary: Delete an Auth User
 *     description: Deletes an AuthUser by ID.
 *     tags:
 *       - AuthUsers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully deleted user.
 *       400:
 *         description: Invalid ID.
 *       401:
 *         description: Unauthorized.
 *       404:
 *         description: User not found.
 *       500:
 *         description: Server error.
 */
export async function DELETE(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const deletedUser = await AuthUser.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "User deleted successfully" },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
