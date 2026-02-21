import { getSessionUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET() {
  await connectDB();

  const user = await getSessionUser();
  if (!user) return errorResponse("Unauthorized", 401, "UNAUTHORIZED");

  return successResponse({ user });
}
