import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import ChatThread from "@/models/ChatThread";

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();

    const threads = await ChatThread.find({ userId: user._id })
      .sort({ lastMessageAt: -1 })
      .lean();

    return successResponse(threads, { count: threads.length });
  } catch {
    return errorResponse("Failed to fetch chat threads", 500, "CHAT_THREADS_FETCH_FAILED");
  }
}

export async function POST(req: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();

    const body = await req.json();
    const title = String(body?.title ?? "").trim() || "New Thread";

    const thread = await ChatThread.create({
      userId: user._id,
      title,
      lastMessageAt: new Date(),
    });

    return successResponse(thread, { statusCode: 201 });
  } catch {
    return errorResponse("Failed to create chat thread", 500, "CHAT_THREAD_CREATE_FAILED");
  }
}
