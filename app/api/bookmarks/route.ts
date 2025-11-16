/**
 * @swagger
 * tags:
 *   - name: Bookmarks
 *     description: Manage bookmarks

 * components:
 *   schemas:
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
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Bookmark'
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
 *               $ref: '#/components/schemas/Bookmark'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import Bookmark from "@/models/Bookmark";
import { connectDB } from "@/lib/mongodb";
import { getThumbnail } from "@/utils/get-thumbnail";

// 📌 GET: Fetch All Bookmarks
export async function GET() {
  await connectDB();
  const bookmarks = await Bookmark.find().sort({ updatedAt: -1 });
  return NextResponse.json(bookmarks);
}

// 📌 POST: Create Bookmark
export async function POST(req: Request) {
  await connectDB();
  const body = await req.json();

  const thumbnail = await getThumbnail(body.link);

  const bookmark = await Bookmark.create({
    ...body,
    thumbnail,
  });

  return NextResponse.json(bookmark, { status: 201 });
}