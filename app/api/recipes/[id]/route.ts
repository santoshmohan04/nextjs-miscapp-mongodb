import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { getUserFromToken } from "@/lib/auth";

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