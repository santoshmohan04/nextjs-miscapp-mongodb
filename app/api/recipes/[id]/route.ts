import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { getUserFromToken } from "@/lib/auth";

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     tags:
 *       - Recipes
 *     summary: Update a recipe by ID
 *     description: Updates an existing recipe belonging to the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the recipe to update
 *         schema:
 *           type: string
 *           example: 6534abf8a31f123456789012
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Paneer Butter Masala"
 *               description:
 *                 type: string
 *                 example: "A rich creamy curry made with paneer and tomato gravy"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Paneer"
 *                     amount:
 *                       type: number
 *                       example: 200
 *               imagePath:
 *                 type: string
 *                 example: "https://source.unsplash.com/400x300/?paneer,indian"
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized (user not logged in)
 *       403:
 *         description: Forbidden (user doesn’t own the recipe)
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     tags:
 *       - Recipes
 *     summary: Delete a recipe by ID
 *     description: Deletes a recipe that belongs to the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The ID of the recipe to delete
 *         schema:
 *           type: string
 *           example: 6534abf8a31f123456789012
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Recipe deleted successfully"
 *                 recipe:
 *                   $ref: '#/components/schemas/Recipe'
 *       401:
 *         description: Unauthorized (user not logged in)
 *       403:
 *         description: Forbidden (user doesn’t own the recipe)
 *       404:
 *         description: Recipe not found
 *       500:
 *         description: Server error
 */

export async function PUT(req: Request, context: { params: any }) {
  try {
    await connectDB();

    // 🔒 Authenticate user
    const rawUser = await getUserFromToken();
    if (!rawUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId =
      typeof rawUser === "string"
        ? rawUser
        : (rawUser as any).id ?? (rawUser as any)._id ?? (rawUser as any).sub;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // normalize params (next typings sometimes make params a Promise)
    const paramsObj =
      typeof context.params?.then === "function"
        ? await context.params
        : context.params;

    // Find recipe and ensure it belongs to the user
    const recipe = await Recipe.findById(paramsObj.id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (recipe.createdBy.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update recipe
    const updatedRecipe = await Recipe.findByIdAndUpdate(paramsObj.id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updatedRecipe, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: any }) {
  try {
    await connectDB();

    // 🔒 Authenticate user
    const rawUser = await getUserFromToken();
    if (!rawUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId =
      typeof rawUser === "string"
        ? rawUser
        : (rawUser as any).id ?? (rawUser as any)._id ?? (rawUser as any).sub;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // normalize params (next typings sometimes make params a Promise)
    const paramsObj =
      typeof context.params?.then === "function"
        ? await context.params
        : context.params;

    // Find recipe and ensure it belongs to the user
    const recipe = await Recipe.findById(paramsObj.id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    if (recipe.createdBy.toString() !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

  const deletedRecipe = await Recipe.findByIdAndDelete(paramsObj.id);

    return NextResponse.json(
      { message: "Recipe deleted successfully", recipe: deletedRecipe },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}