import mongoose, { Schema, Document } from "mongoose";

const RecipeSchema = new Schema(
  {
    name: String,
    description: String,
    imagePath: String,
    ingredients: [
      {
        name: String,
        amount: Number,
      },
    ],
    createdBy: { type: Schema.Types.ObjectId, ref: "AuthUser", required: true }, // ✅ FIXED
  },
  { timestamps: true }
);

export const Recipe =
  mongoose.models.Recipe || mongoose.model("Recipe", RecipeSchema);
