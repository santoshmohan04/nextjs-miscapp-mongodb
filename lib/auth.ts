import { cookies } from "next/headers";
import { verifyToken } from "./jwt";
import AuthUser from "@/models/User";

export async function getSessionUser() {
  const token = (await cookies()).get("token")?.value;
  if (!token) return null;

  const decoded = await verifyToken(token);
  if (!decoded) return null;

  const id = decoded.payload.id;
  return await AuthUser.findById(id).select("-password");
}
