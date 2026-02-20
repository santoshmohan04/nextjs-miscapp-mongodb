import { jwtVerify, SignJWT } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: any, expires = "7d") {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expires)
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    return await jwtVerify(token, secret);
  } catch {
    return null;
  }
}
