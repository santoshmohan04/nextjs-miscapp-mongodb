import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export async function middleware(req: any) {
  const token = req.cookies.get("token")?.value;

  if (!token) return NextResponse.redirect(new URL("/auth", req.url));

  const valid = await verifyToken(token);
  if (!valid) return NextResponse.redirect(new URL("/auth", req.url));

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"], // protect routes
};
