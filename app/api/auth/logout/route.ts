import { successResponse } from "@/lib/api-response";

export async function POST() {
  const res = successResponse({ message: "Logged out" });

  res.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return res;
}
