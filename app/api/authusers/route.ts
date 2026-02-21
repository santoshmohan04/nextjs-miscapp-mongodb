import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getSessionUser, requireRole } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { errorResponse, successResponse } from "@/lib/api-response";

/**
 * @swagger
 * /api/authusers:
 *   get:
 *     summary: Get all Auth Users (paginated)
 *     description: Fetches a paginated list of registered users. Requires authentication.
 *     tags:
 *       - AuthUsers
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search users by name.
 *     responses:
 *       200:
 *         description: Successfully fetched list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized access.
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
 *       403:
 *         description: Forbidden. Admin role required.
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
 *         description: Server error.
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
export async function GET(req: Request) {
  try {
    await connectDB();

    const currentUser = await getSessionUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    if (!requireRole(currentUser, "admin")) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const limit = Math.max(
      1,
      parseInt(url.searchParams.get("limit") || "12", 10)
    );
    const skip = (page - 1) * limit;

    const search = url.searchParams.get("q") || "";
    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    const total = await AuthUser.countDocuments(filter);
    const users = await AuthUser.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password");

    return successResponse(users, { total, page, limit });
  } catch (err: any) {
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}

/**
 * @swagger
 * /api/authusers:
 *   post:
 *     summary: Create a new Auth User
 *     description: Creates a new user in the AuthUser collection. Requires authentication.
 *     tags:
 *       - AuthUsers
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               profilepic:
 *                 type: string
 *     responses:
 *       201:
 *         description: Successfully created user.
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
 *       400:
 *         description: Missing required fields.
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
 *       401:
 *         description: Unauthorized.
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
 *       403:
 *         description: Forbidden. Admin role required.
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
 *         description: Email already exists.
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
 *         description: Server error.
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

    const currentUser = await getSessionUser();
    if (!currentUser) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    if (!requireRole(currentUser, "admin")) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const { name, email, password, profilepic } = await req.json();

    if (!name || !email || !password) {
      return errorResponse("Missing required fields", 400, "VALIDATION_ERROR");
    }

    // Check if user exists
    const exists = await AuthUser.findOne({ email });
    if (exists) {
      return errorResponse("Email already exists", 409, "EMAIL_EXISTS");
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    const newUser = await AuthUser.create({
      name,
      email,
      password: hashed,
      profilepic: profilepic || null,
    });

    // Remove password before sending
    const { password: _pw, ...userData } = newUser.toObject();

    return successResponse(userData, { statusCode: 201 });
  } catch (err: any) {
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}
