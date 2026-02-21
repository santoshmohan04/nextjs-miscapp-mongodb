import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import Note from "@/models/Note";

function parseTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return Array.from(new Set(input.map((tag) => String(tag).trim()).filter(Boolean)));
  }

  if (typeof input === "string") {
    return Array.from(new Set(input.split(",").map((tag) => tag.trim()).filter(Boolean)));
  }

  return [];
}

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errorResponse("Invalid note id", 400, "INVALID_NOTE_ID");
    }

    await connectDB();

    const note = await Note.findOne({
      _id: id,
      userId: sessionUser._id,
    });

    if (!note) {
      return errorResponse("Note not found", 404, "NOTE_NOT_FOUND");
    }

    return successResponse(note);
  } catch {
    return errorResponse("Failed to fetch note", 500, "NOTE_FETCH_FAILED");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errorResponse("Invalid note id", 400, "INVALID_NOTE_ID");
    }

    await connectDB();

    const body = await req.json();

    const updatePayload: Record<string, unknown> = {};

    if (body?.title !== undefined) {
      const title = String(body.title).trim();
      if (!title) {
        return errorResponse("Title cannot be empty", 400, "VALIDATION_ERROR");
      }
      updatePayload.title = title;
    }

    if (body?.content !== undefined) {
      updatePayload.content = String(body.content ?? "");
    }

    if (body?.tags !== undefined) {
      updatePayload.tags = parseTags(body.tags);
    }

    if (body?.pinned !== undefined) {
      updatePayload.pinned = Boolean(body.pinned);
    }

    const updated = await Note.findOneAndUpdate(
      { _id: id, userId: sessionUser._id },
      updatePayload,
      { new: true }
    );

    if (!updated) {
      return errorResponse("Note not found", 404, "NOTE_NOT_FOUND");
    }

    return successResponse(updated);
  } catch {
    return errorResponse("Failed to update note", 500, "NOTE_UPDATE_FAILED");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { id } = await params;

    if (!isValidObjectId(id)) {
      return errorResponse("Invalid note id", 400, "INVALID_NOTE_ID");
    }

    await connectDB();

    const deleted = await Note.findOneAndDelete({
      _id: id,
      userId: sessionUser._id,
    });

    if (!deleted) {
      return errorResponse("Note not found", 404, "NOTE_NOT_FOUND");
    }

    return successResponse({ message: "Deleted" });
  } catch {
    return errorResponse("Failed to delete note", 500, "NOTE_DELETE_FAILED");
  }
}
