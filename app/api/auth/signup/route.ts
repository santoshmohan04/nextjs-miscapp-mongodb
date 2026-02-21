import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { signToken } from "@/lib/jwt";
import { errorResponse, successResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new account by storing name, email, and password securely.
 *     tags:
 *       - Authentication
 *     responses:
 *       201:
 *         description: Signup successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     user:
 *                       type: object
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *       409:
 *         description: Email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                     code:
 *                       type: string
 */
export async function POST(req: Request) {
  try {
    await connectDB();
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return errorResponse("All fields required", 400, "VALIDATION_ERROR");

    const exists = await AuthUser.findOne({ email });
    if (exists)
      return errorResponse("Email already exists", 409, "EMAIL_EXISTS");

    const hashed = await bcrypt.hash(password, 10);

    const user = await AuthUser.create({
      name,
      email,
      password: hashed,
    });

    const token = await signToken({ id: user._id.toString() });

    const res = successResponse(
      { message: "Signup successful", user },
      { statusCode: 201 }
    );
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 86400,
      path: "/",
    });

    return res;
  } catch (err: any) {
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}
