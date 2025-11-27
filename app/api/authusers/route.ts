import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import AuthUser from "@/models/User";
import { getSessionUser } from "@/lib/auth";
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
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Server error.
 */
export async function GET(req: Request) {
  try {
    await connectDB();

    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json({
      data: users,
      meta: { total, page, limit },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
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
 *       400:
 *         description: Missing required fields.
 *       401:
 *         description: Unauthorized.
 *       409:
 *         description: Email already exists.
 *       500:
 *         description: Server error.
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    const currentUser = await getSessionUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email, password, profilepic } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists
    const exists = await AuthUser.findOne({ email });
    if (exists) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
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

    return NextResponse.json(userData, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
