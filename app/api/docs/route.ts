import { getApiDocs } from "@/lib/swagger";
import { successResponse } from "@/lib/api-response";

export async function GET() {
  const spec = await getApiDocs();
  return successResponse(spec);
}