import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import ChatThread from "@/models/ChatThread";
import ChatMessage from "@/models/ChatMessage";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid thread id", 400, "INVALID_THREAD_ID");
    }

    await connectDB();

    const thread = await ChatThread.findOne({ _id: id, userId: user._id }).lean();
    if (!thread) {
      return errorResponse("Thread not found", 404, "THREAD_NOT_FOUND");
    }

    const messages = await ChatMessage.find({ threadId: thread._id })
      .sort({ createdAt: 1 })
      .lean();

    return successResponse({ thread, messages });
  } catch {
    return errorResponse("Failed to fetch thread", 500, "CHAT_THREAD_FETCH_FAILED");
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid thread id", 400, "INVALID_THREAD_ID");
    }

    await connectDB();

    const body = await req.json();
    const title = String(body?.title ?? "").trim();

    if (!title) {
      return errorResponse("Title is required", 400, "VALIDATION_ERROR");
    }

    const updated = await ChatThread.findOneAndUpdate(
      { _id: id, userId: user._id },
      { title },
      { new: true }
    );

    if (!updated) {
      return errorResponse("Thread not found", 404, "THREAD_NOT_FOUND");
    }

    return successResponse(updated);
  } catch {
    return errorResponse("Failed to rename thread", 500, "CHAT_THREAD_RENAME_FAILED");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { id } = await params;
    if (!isValidObjectId(id)) {
      return errorResponse("Invalid thread id", 400, "INVALID_THREAD_ID");
    }

    await connectDB();

    const deletedThread = await ChatThread.findOneAndDelete({ _id: id, userId: user._id });

    if (!deletedThread) {
      return errorResponse("Thread not found", 404, "THREAD_NOT_FOUND");
    }

    await ChatMessage.deleteMany({ threadId: deletedThread._id });

    return successResponse({ message: "Deleted" });
  } catch {
    return errorResponse("Failed to delete thread", 500, "CHAT_THREAD_DELETE_FAILED");
  }
}
