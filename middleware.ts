// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
// Use `jose` in middleware/edge runtime instead of `jsonwebtoken` (node-only)
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // jwtVerify expects a KeyLike — for HMAC secrets provide a Uint8Array
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "");
    await jwtVerify(token, secret);
    return NextResponse.next();
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

// Apply middleware only to API routes
export const config = {
  matcher: ["/api/:path*"],
};