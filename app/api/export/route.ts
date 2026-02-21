/**
 * @swagger
 * tags:
 *   - name: Export
 *     description: Export user data
 *
 * /api/export:
 *   get:
 *     summary: Export all user data
 *     description: Exports all data belonging to the authenticated user (recipes, bookmarks, notes, chat threads, and messages). Supports JSON and CSV formats.
 *     tags:
 *       - Export
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format (json or csv)
 *     responses:
 *       200:
 *         description: User data exported successfully
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
 *                     user:
 *                       type: object
 *                     recipes:
 *                       type: array
 *                     bookmarks:
 *                       type: array
 *                     notes:
 *                       type: array
 *                     chatThreads:
 *                       type: array
 *                     chatMessages:
 *                       type: array
 *           text/csv:
 *             schema:
 *               type: string
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

import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import { Recipe } from "@/models/Recipe";
import Bookmark from "@/models/Bookmark";
import Note from "@/models/Note";
import ChatThread from "@/models/ChatThread";
import ChatMessage from "@/models/ChatMessage";

/**
 * Convert array of objects to CSV string
 */
function convertToCSV(data: any[], type: string): string {
  if (!data || data.length === 0) {
    return `# ${type}\n(No data)\n\n`;
  }

  const headers = Object.keys(data[0]);
  const csvRows = [
    `# ${type}`,
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle complex objects and arrays
          if (value === null || value === undefined) return "";
          if (typeof value === "object") return JSON.stringify(value);
          // Escape quotes and wrap in quotes if contains comma or quote
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
    "", // Empty line between sections
  ];

  return csvRows.join("\n");
}

/**
 * Export all user data
 */
export async function GET(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();

    // Get format from query parameter (default: json)
    const searchParams = req.nextUrl.searchParams;
    const format = searchParams.get("format") || "json";

    // Fetch all user data in parallel
    const [recipes, bookmarks, notes, chatThreads] = await Promise.all([
      Recipe.find({ createdBy: sessionUser._id }).lean(),
      Bookmark.find({ createdBy: sessionUser._id }).lean(),
      Note.find({ userId: sessionUser._id }).lean(),
      ChatThread.find({ userId: sessionUser._id }).lean(),
    ]);

    // Get all chat messages for user's threads
    const threadIds = chatThreads.map((thread: any) => thread._id);
    const chatMessages = await ChatMessage.find({
      threadId: { $in: threadIds },
    }).lean();

    // Prepare user data (exclude password)
    const userData = {
      _id: sessionUser._id,
      name: sessionUser.name,
      email: sessionUser.email,
      role: sessionUser.role,
      profilepic: sessionUser.profilepic,
      avatarKey: sessionUser.avatarKey,
      createdAt: sessionUser.createdAt,
      updatedAt: sessionUser.updatedAt,
    };

    const exportData = {
      user: userData,
      recipes,
      bookmarks,
      notes,
      chatThreads,
      chatMessages,
    };

    // Note: Activity logging for export not implemented in ActivityType enum

    // Return CSV format if requested
    if (format === "csv") {
      const csvContent = [
        convertToCSV([userData], "User Profile"),
        convertToCSV(recipes, "Recipes"),
        convertToCSV(bookmarks, "Bookmarks"),
        convertToCSV(notes, "Notes"),
        convertToCSV(chatThreads, "Chat Threads"),
        convertToCSV(chatMessages, "Chat Messages"),
      ].join("\n");

      return new Response(csvContent, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="user-data-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Return JSON format (default)
    return successResponse(exportData, {
      exportedAt: new Date().toISOString(),
      format: "json",
      counts: {
        recipes: recipes.length,
        bookmarks: bookmarks.length,
        notes: notes.length,
        chatThreads: chatThreads.length,
        chatMessages: chatMessages.length,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return errorResponse("Failed to export data", 500, "EXPORT_FAILED");
  }
}
