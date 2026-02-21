import ChatHistory from "@/models/ChatHistory";
import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  try {
    await connectDB();

    const user = await getSessionUser();
    if (!user) return errorResponse("Unauthorized", 401, "UNAUTHORIZED");

    const data = await ChatHistory.findOne({ userId: user._id });

    return successResponse(data || { messages: [] });
  } catch {
    return errorResponse("Failed to fetch chat history", 500, "CHAT_HISTORY_FETCH_FAILED");
  }
}
