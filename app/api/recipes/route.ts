import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import mongoose from "mongoose";
import { getSessionUser } from "@/lib/auth";
import { errorResponse, successResponse } from "@/lib/api-response";

function parseTags(input: unknown): string[] {
  if (Array.isArray(input)) {
    return Array.from(
      new Set(input.map((tag) => String(tag).trim()).filter(Boolean))
    );
  }

  if (typeof input === "string") {
    return Array.from(
      new Set(input.split(",").map((tag) => tag.trim()).filter(Boolean))
    );
  }

  return [];
}

function parseFavoriteFilter(value: string | null): boolean | undefined {
  if (!value) return undefined;

  const normalized = value.trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(normalized)) return true;
  if (["false", "0", "no", "n"].includes(normalized)) return false;

  return undefined;
}

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

    const payload = {
      ...body,
      favorite: Boolean(body?.favorite),
      tags: parseTags(body?.tags),
    };

    // Save recipe with authenticated user ID
    const recipe = await Recipe.create({
      ...payload,
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
export async function GET(req: Request) {
  try {
    await connectDB();

    // 🔐 Authenticate user
    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { searchParams } = new URL(req.url);

    const page = Math.max(1, Number(searchParams.get("page") ?? 1));
    const limit = Math.min(
      100,
      Math.max(1, Number(searchParams.get("limit") ?? 10))
    );
    const q = (searchParams.get("q") ?? "").trim();
    const tag = (searchParams.get("tag") ?? "").trim();
    const favorite = parseFavoriteFilter(searchParams.get("favorite"));

    const query: Record<string, unknown> = {
      createdBy: new mongoose.Types.ObjectId(user._id),
    };

    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (favorite !== undefined) {
      query.favorite = favorite;
    }

    const total = await Recipe.countDocuments(query);

    const recipes = await Recipe.find(query)
      .sort({ favorite: -1, updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return successResponse(recipes, {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      count: recipes.length,
      q,
      tag,
      favorite,
    });
  } catch (err: any) {
    console.error("GET /api/recipes error:", err);
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}
