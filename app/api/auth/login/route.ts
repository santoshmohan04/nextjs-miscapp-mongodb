import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { signToken } from "@/lib/jwt";
import { errorResponse, successResponse } from "@/lib/api-response";

/**
 * Login route
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const { email, password } = await req.json();

    if (!email || !password)
      return errorResponse("Email & password required", 400, "VALIDATION_ERROR");

    const user = await AuthUser.findOne({ email }).select("+password");
    if (!user)
      return errorResponse("Invalid credentials", 401, "INVALID_CREDENTIALS");

    const stored = user.password ?? "";
    const match = await bcrypt.compare(password, stored);

    if (!match)
      return errorResponse("Invalid credentials", 401, "INVALID_CREDENTIALS");

    const token = await signToken({ id: user._id.toString() });

    const safeUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      profilepic: user.profilepic ?? "",
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const res = successResponse({ message: "Login success", user: safeUser });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 7 * 86400,
    });

    return res;
  } catch (err: any) {
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}
