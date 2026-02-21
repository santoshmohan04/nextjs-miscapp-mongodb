import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getSessionUser, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { errorResponse, successResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/authusers/{id}:
 *   put:
 *     summary: Update an Auth User by ID
 *     description: Updates a user account. Requires authentication and admin role.
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
 *         description: Auth user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profilepic:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
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
 *       400:
 *         description: Invalid user ID
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
 *         description: Unauthorized
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
 *       403:
 *         description: Forbidden. Admin role required.
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
 *
 *   delete:
 *     summary: Delete an Auth User by ID
 *     description: Deletes a user account. Requires authentication and admin role.
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
 *         description: Auth user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *         description: Invalid user ID
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
 *         description: Unauthorized
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
 *       403:
 *         description: Forbidden. Admin role required.
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

// ------------------------
// UPDATE USER
// ------------------------
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getSessionUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    if (!requireRole(currentUser, "admin")) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid user ID", 400, "INVALID_USER_ID");
    }

    const body = await req.json();

    const update: any = {
      name: body.name,
      email: body.email,
      profilepic: body.profilepic,
      updatedAt: new Date(),
    };

    if (body.password) {
      update.password = await bcrypt.hash(body.password, 10);
    }

    const updatedUser = await AuthUser.findByIdAndUpdate(id, update, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return errorResponse("User not found", 404, "USER_NOT_FOUND");
    }

    return successResponse(updatedUser);
  } catch (err: any) {
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}

// ------------------------
// DELETE USER
// ------------------------
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const currentUser = await getSessionUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    if (!requireRole(currentUser, "admin")) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid user ID", 400, "INVALID_USER_ID");
    }

    const deletedUser = await AuthUser.findByIdAndDelete(id);

    if (!deletedUser) {
      return errorResponse("User not found", 404, "USER_NOT_FOUND");
    }

    return successResponse({ message: "User deleted successfully" });
  } catch (err: any) {
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}
