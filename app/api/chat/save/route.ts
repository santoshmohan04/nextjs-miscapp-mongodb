import ChatHistory from "@/models/ChatHistory";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    await connectDB();

    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const msg = await req.json();

    await ChatHistory.findOneAndUpdate(
      { userId: user._id },
      { $push: { messages: msg } },
      { upsert: true }
    );

    return successResponse({ message: "Saved" });
  } catch {
    return errorResponse("Failed to save chat message", 500, "CHAT_SAVE_FAILED");
  }
}
