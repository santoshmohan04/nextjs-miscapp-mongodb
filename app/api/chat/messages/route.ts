import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import ChatThread from "@/models/ChatThread";
import ChatMessage from "@/models/ChatMessage";

function isValidObjectId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const body = await req.json();
    const threadId = String(body?.threadId ?? "");
    const sender = String(body?.sender ?? "").trim();
    const text = String(body?.text ?? "").trim();

    if (!isValidObjectId(threadId)) {
      return errorResponse("Invalid thread id", 400, "INVALID_THREAD_ID");
    }

    if (!sender || !text) {
      return errorResponse("sender and text are required", 400, "VALIDATION_ERROR");
    }

    await connectDB();

    const thread = await ChatThread.findOne({ _id: threadId, userId: user._id });

    if (!thread) {
      return errorResponse("Thread not found", 404, "THREAD_NOT_FOUND");
    }

    const message = await ChatMessage.create({
      threadId: thread._id,
      sender,
      text,
    });

    thread.lastMessageAt = new Date();
    await thread.save();

    return successResponse(message, { statusCode: 201 });
  } catch {
    return errorResponse("Failed to create chat message", 500, "CHAT_MESSAGE_CREATE_FAILED");
  }
}
