/**
 * @swagger
 * /api/bookmarks/{id}:
 *   put:
 *     summary: Update a bookmark
 *     description: Updates an existing bookmark by ID.
 *     tags:
 *       - Bookmarks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bookmark ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               link:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               favorite:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Bookmark updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Bookmark'
 *       400:
 *         description: Invalid input
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
 *       404:
 *         description: Bookmark not found
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
 *     summary: Delete a bookmark
 *     description: Deletes a bookmark by ID.
 *     tags:
 *       - Bookmarks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Bookmark ID
 *     responses:
 *       200:
 *         description: Bookmark deleted successfully
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
 *                       example: Deleted
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
 *       404:
 *         description: Bookmark not found
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

import Bookmark from "@/models/Bookmark";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import { logActivity } from "@/lib/activity-log";

export async function PUT(req: Request, { params }: any) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();
    const body = await req.json();

    const updated = await Bookmark.findOneAndUpdate(
      { _id: params.id, createdBy: sessionUser._id },
      body,
      {
        new: true,
      }
    );

    if (!updated) {
      return errorResponse("Bookmark not found", 404, "BOOKMARK_NOT_FOUND");
    }

    return successResponse(updated);
  } catch {
    return errorResponse("Failed to update bookmark", 500, "BOOKMARK_UPDATE_FAILED");
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();

    const deleted = await Bookmark.findOneAndDelete({
      _id: params.id,
      createdBy: sessionUser._id,
    });

    if (!deleted) {
      return errorResponse("Bookmark not found", 404, "BOOKMARK_NOT_FOUND");
    }

    await logActivity(sessionUser._id, "BOOKMARK_DELETED", "bookmark", deleted._id, {
      title: deleted.title,
      link: deleted.link,
    });

    return successResponse({ message: "Deleted" });
  } catch {
    return errorResponse("Failed to delete bookmark", 500, "BOOKMARK_DELETE_FAILED");
  }
}