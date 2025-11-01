import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { getUserFromToken } from "@/lib/auth";
import mongoose from "mongoose";

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

