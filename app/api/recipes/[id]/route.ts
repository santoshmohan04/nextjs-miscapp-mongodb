import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { getSessionUser } from "@/lib/auth";

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     tags:
 *       - Recipes
 *     summary: Update a recipe by ID
 *     description: Updates a recipe owned by the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The recipe ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/Recipe"
 *     responses:
 *       200:
 *         description: Recipe updated successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Recipe not found.
 *       500:
 *         description: Server error.
 */

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     tags:
 *       - Recipes
 *     summary: Delete a recipe by ID
 *     description: Deletes a recipe owned by the authenticated user.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The recipe ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Recipe deleted successfully.
 *       401:
 *         description: Unauthorized.
 *       403:
 *         description: Forbidden.
 *       404:
 *         description: Recipe not found.
 *       500:
 *         description: Server error.
 */

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipe = await Recipe.findById(params.id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Ensure recipe belongs to logged-in user
    if (recipe.createdBy.toString() !== user._id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const updatedRecipe = await Recipe.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    return NextResponse.json(updatedRecipe, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const recipe = await Recipe.findById(params.id);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    // Ensure recipe belongs to logged-in user
    if (recipe.createdBy.toString() !== user._id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const deleted = await Recipe.findByIdAndDelete(params.id);

    return NextResponse.json(
      {
        message: "Recipe deleted successfully",
        recipe: deleted,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
