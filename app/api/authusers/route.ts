import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getUserFromToken } from "@/lib/auth";
import bcrypt from "bcryptjs";

/**
 * @swagger
 * /api/authusers:
 *   get:
 *     summary: Get all Auth Users (paginated)
 *     description: Fetches a paginated list of registered users. Requires authentication.
 *     tags:
 *       - AuthUsers
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *         description: Number of users per page.
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search users by name (case-insensitive).
 *     responses:
 *       200:
 *         description: Successfully fetched list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 67298f9cc63f7f1f90f3b2f2
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: johndoe@example.com
 *                       profilePic:
 *                         type: string
 *                         example: https://example.com/avatar.jpg
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 12
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/authusers:
 *   post:
 *     summary: Create a new Auth User
 *     description: Creates a new user in the AuthUser collection. Requires authentication.
 *     tags:
 *       - AuthUsers
 *     security:
 *       - bearerAuth: []
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
 *                 example: Jane Smith
 *               email:
 *                 type: string
 *                 example: janesmith@example.com
 *               password:
 *                 type: string
 *                 example: "Password@123"
 *               profilePic:
 *                 type: string
 *                 example: https://example.com/avatar.png
 *     responses:
 *       201:
 *         description: Successfully created user.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: 67298f9cc63f7f1f90f3b2f2
 *                 name:
 *                   type: string
 *                   example: Jane Smith
 *                 email:
 *                   type: string
 *                   example: janesmith@example.com
 *                 profilePic:
 *                   type: string
 *                   example: https://example.com/avatar.png
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Unauthorized.
 *       409:
 *         description: Email already exists.
 *       500:
 *         description: Server error.
 */

export async function GET(req: Request) {
  try {
    await connectDB();

    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1", 10);
    const limit = parseInt(url.searchParams.get("limit") || "12", 10);
    const skip = (page - 1) * limit;

    // optional search
    const search = url.searchParams.get("q") || "";

    const filter = search ? { name: { $regex: search, $options: "i" } } : {};

    const total = await AuthUser.countDocuments(filter);
    const users = await AuthUser.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-password");

    return NextResponse.json({ data: users, meta: { total, page, limit } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔒 Authenticate user
    const user = await getUserFromToken();
    if (!user || typeof user === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { name, email, password, profilePic } = body;

    if (!name || !email || !password) {
      return new NextResponse(JSON.stringify({ message: "Missing fields" }), {
        status: 400,
      });
    }

    // check existing
    const exists = await AuthUser.findOne({ email });
    if (exists) {
      return new NextResponse(
        JSON.stringify({ message: "Email already exists" }),
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);
    const authuser = await AuthUser.create({
      name,
      email,
      password: hashed,
      profilePic,
    });

    // return without password
    const { password: _p, ...rest } = authuser.toObject();
    return NextResponse.json(rest, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
