import { connectDB } from "@/lib/mongodb";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";
import ActivityLog from "@/models/ActivityLog";

export async function GET(req: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? 20)));

    const query = { userId: sessionUser._id };

    const total = await ActivityLog.countDocuments(query);

    const activities = await ActivityLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return successResponse(activities, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      count: activities.length,
    });
  } catch {
    return errorResponse("Failed to fetch activity", 500, "ACTIVITY_FETCH_FAILED");
  }
}
