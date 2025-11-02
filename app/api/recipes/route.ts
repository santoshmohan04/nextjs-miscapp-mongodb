import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { getUserFromToken } from "@/lib/auth";
import mongoose from "mongoose";

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
 *                 example: "Puliyodarai (Tamarind Rice)"
 *               description:
 *                 type: string
 *                 example: "A tangy South Indian rice dish made with tamarind and spices."
 *               imagePath:
 *                 type: string
 *                 example: "https://source.unsplash.com/400x300/?indian,food"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Tamarind"
 *                     amount:
 *                       type: number
 *                       example: 100
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized (user not logged in)
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get all recipes for the logged-in user
 *     description: Retrieves a list of recipes created by the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of recipes for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized (user not logged in)
 *       500:
 *         description: Server error
 */

export async function POST(req: Request) {
  try {
    await connectDB();

    // 🔒 Authenticate user
    const user = await getUserFromToken();
    if (!user || typeof user === "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Optionally attach the user id to the recipe
    const userId = (user as any).id;
    const recipe = new Recipe({ ...body, createdBy: userId });
    await recipe.save();

    return NextResponse.json(recipe, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();

    const user = await getUserFromToken();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Convert string id directly to ObjectId
    const userId = new mongoose.Types.ObjectId((user as { id: string }).id);

    const recipes = await Recipe.find({ createdBy: userId });
    return NextResponse.json(recipes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

