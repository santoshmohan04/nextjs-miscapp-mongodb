/**
 * @swagger
 * tags:
 *   - name: Bookmarks
 *     description: Manage bookmarks

 * components:
 *   schemas:
 *     ApiError:
 *       type: object
 *       required:
 *         - success
 *         - error
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: object
 *           required:
 *             - message
 *           properties:
 *             message:
 *               type: string
 *             code:
 *               type: string
 *     Bookmark:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         link:
 *           type: string
 *         description:
 *           type: string
 *         category:
 *           type: string
 *         favorite:
 *           type: boolean
 *         thumbnail:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *
 * /api/bookmarks:
 *   get:
 *     summary: Get all bookmarks
 *     description: Returns all bookmarks sorted by latest updated.
 *     tags:
 *       - Bookmarks
 *     responses:
 *       200:
 *         description: List of bookmarks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Bookmark'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     count:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 *   post:
 *     summary: Create a new bookmark
 *     description: Creates a bookmark and automatically generates a thumbnail.
 *     tags:
 *       - Bookmarks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: Google
 *               link:
 *                 type: string
 *                 example: https://google.com
 *               description:
 *                 type: string
 *                 example: Search Engine
 *               category:
 *                 type: string
 *                 example: General
 *               favorite:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       201:
 *         description: Bookmark created successfully
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
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */

import Bookmark from "@/models/Bookmark";
import { connectDB } from "@/lib/mongodb";
import { getThumbnail } from "@/utils/get-thumbnail";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";

// 📌 GET: Fetch All Bookmarks
export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();
    const bookmarks = await Bookmark.find({ createdBy: sessionUser._id }).sort({
      updatedAt: -1,
    });

    return successResponse(bookmarks, {
      count: bookmarks.length,
    });
  } catch {
    return errorResponse("Failed to fetch bookmarks", 500, "BOOKMARKS_FETCH_FAILED");
  }
}

// 📌 POST: Create Bookmark
export async function POST(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();
    const body = await req.json();

    const thumbnail = await getThumbnail(body.link);

    const bookmark = await Bookmark.create({
      ...body,
      createdBy: sessionUser._id,
      thumbnail,
    });

    return successResponse(bookmark, { statusCode: 201 });
  } catch {
    return errorResponse("Failed to create bookmark", 500, "BOOKMARK_CREATE_FAILED");
  }
}