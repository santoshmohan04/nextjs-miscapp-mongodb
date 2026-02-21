import { jwtVerify } from "jose";
import { NextRequest, NextResponse } from "next/server";

const TOKEN_COOKIE_NAME = "token";
const jwtSecret = process.env.JWT_SECRET;
const jwtSecretKey = jwtSecret ? new TextEncoder().encode(jwtSecret) : null;

async function isAuthenticated(req: NextRequest) {
  const token = req.cookies.get(TOKEN_COOKIE_NAME)?.value;

  if (!token || !jwtSecretKey) {
    return false;
  }

  try {
    await jwtVerify(token, jwtSecretKey);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const authenticated = await isAuthenticated(req);

  if (authenticated) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/auth", req.url);
  const originalDestination = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  loginUrl.searchParams.set("redirect", originalDestination);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/recipes/:path*",
    "/bookmarks/:path*",
    "/chatapp/:path*",
    "/profile/:path*",
    "/authusers/:path*",
    "/notes/:path*",
  ],
};
