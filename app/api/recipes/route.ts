import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";

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
 *       401:
 *         description: Unauthorized
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

    // 🔐 Authenticate user using new getSessionUser()
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const body = await req.json();

    // Save recipe with authenticated user ID
    const recipe = await Recipe.create({
      ...body,
      createdBy: new mongoose.Types.ObjectId(user._id),
    });

    return successResponse(recipe, { statusCode: 201 });
  } catch (err: any) {
    console.error("POST /api/recipes error:", err);
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
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
 *       401:
 *         description: Unauthorized
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
export async function GET() {
  try {
    await connectDB();

    // 🔐 Authenticate user
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const recipes = await Recipe.find({
      createdBy: new mongoose.Types.ObjectId(user._id),
    });

    return successResponse(recipes);
  } catch (err: any) {
    console.error("GET /api/recipes error:", err);
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}
