import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth";

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     tags:
 *       - Recipes
 *     summary: Create a new recipe
 *     description: Creates a new recipe and associates it with the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Puliyodarai"
 *               description:
 *                 type: string
 *                 example: "A tangy South Indian rice dish"
 *               imagePath:
 *                 type: string
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     amount:
 *                       type: number
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔐 Authenticate user using new getSessionUser()
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Save recipe with authenticated user ID
    const recipe = await Recipe.create({
      ...body,
      createdBy: new mongoose.Types.ObjectId(user._id),
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch (err: any) {
    console.error("POST /api/recipes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get all recipes for current user
 *     description: Fetches recipes created by the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of recipes
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    await connectDB();

    // 🔐 Authenticate user
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipes = await Recipe.find({
      createdBy: new mongoose.Types.ObjectId(user._id),
    });

    return NextResponse.json(recipes);
  } catch (err: any) {
    console.error("GET /api/recipes error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
