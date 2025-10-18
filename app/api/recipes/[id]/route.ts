import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();

    const updatedRecipe = await Recipe.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

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

    const deletedRecipe = await Recipe.findByIdAndDelete(params.id);

    if (!deletedRecipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Recipe deleted successfully", recipe: deletedRecipe },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
