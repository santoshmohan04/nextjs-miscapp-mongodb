// app/api/recipes/route.ts
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    const recipe = new Recipe(body);
    await recipe.save();

    return NextResponse.json(recipe, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectDB();
    const recipes = await Recipe.find();
    return NextResponse.json(recipes);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
