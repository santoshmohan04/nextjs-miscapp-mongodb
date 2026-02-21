import { NextRequest } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Recipe } from "@/models/Recipe";
import { getSessionUser } from "@/lib/auth";
import mongoose from "mongoose";
import { errorResponse, successResponse } from "@/lib/api-response";
import { logActivity } from "@/lib/activity-log";

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

// ------------------------
// UPDATE RECIPE
// ------------------------
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { id } = await params;

    // Validate id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid recipe ID", 400, "INVALID_RECIPE_ID");
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return errorResponse("Recipe not found", 404, "RECIPE_NOT_FOUND");
    }

    // Check recipe ownership
    if (recipe.createdBy.toString() !== user._id.toString()) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const body = await req.json();

    const payload: Record<string, unknown> = { ...body };

    if (body?.favorite !== undefined) {
      payload.favorite = Boolean(body.favorite);
    }

    if (body?.tags !== undefined) {
      payload.tags = parseTags(body.tags);
    }

    const updated = await Recipe.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    });

    if (updated) {
      await logActivity(user._id, "RECIPE_UPDATED", "recipe", updated._id, {
        name: updated.name,
      });
    }

    return successResponse(updated);
  } catch (err: any) {
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}

// ------------------------
// DELETE RECIPE
// ------------------------
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const user = await getSessionUser();
    if (!user) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }

    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse("Invalid recipe ID", 400, "INVALID_RECIPE_ID");
    }

    const recipe = await Recipe.findById(id);
    if (!recipe) {
      return errorResponse("Recipe not found", 404, "RECIPE_NOT_FOUND");
    }

    // Check ownership
    if (recipe.createdBy.toString() !== user._id.toString()) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const deleted = await Recipe.findByIdAndDelete(id);

    if (deleted) {
      await logActivity(user._id, "RECIPE_DELETED", "recipe", deleted._id, {
        name: deleted.name,
      });
    }

    return successResponse({
      message: "Recipe deleted successfully",
      recipe: deleted,
    });
  } catch (err: any) {
    return errorResponse(err.message, 500, "INTERNAL_SERVER_ERROR");
  }
}
