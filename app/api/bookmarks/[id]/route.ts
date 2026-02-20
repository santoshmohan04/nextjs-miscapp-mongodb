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
 *               $ref: '#/components/schemas/Bookmark'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Bookmark not found
 *       500:
 *         description: Server error
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
 *                 message:
 *                   type: string
 *                   example: Deleted
 *       404:
 *         description: Bookmark not found
 *       500:
 *         description: Server error
 */

import { NextResponse } from "next/server";
import Bookmark from "@/models/Bookmark";
import { connectDB } from "@/lib/mongodb";

export async function PUT(req: Request, { params }: any) {
  await connectDB();
  const body = await req.json();

  const updated = await Bookmark.findByIdAndUpdate(params.id, body, {
    new: true,
  });

  if (!updated) {
    return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(req: Request, { params }: any) {
  await connectDB();

  const deleted = await Bookmark.findByIdAndDelete(params.id);

  if (!deleted) {
    return NextResponse.json({ error: "Bookmark not found" }, { status: 404 });
  }

  return NextResponse.json({ message: "Deleted" });
}