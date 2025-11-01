// models/Recipe.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIngredient {
  name: string;
  amount: number;
}

export interface IRecipe extends Document {
  name: string;
  description: string;
  imagePath: string;
  ingredients: IIngredient[];
  createdBy: mongoose.Schema.Types.ObjectId;
}

// Ingredient schema (no _id for subdocuments)
const IngredientSchema = new Schema(
  {
    name: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const RecipeSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    imagePath: { type: String, required: true },
    ingredients: { type: [IngredientSchema], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "AuthUser", required: true },
  },
  { timestamps: true }
);

// Prevent model overwrite in dev hot reload
export const Recipe: Model<IRecipe> =
  mongoose.models.Recipe || mongoose.model<IRecipe>("Recipe", RecipeSchema);
