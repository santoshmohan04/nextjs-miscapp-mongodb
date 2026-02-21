import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecipeIngredient {
  name: string;
  amount: number;
}

export interface IRecipe {
  name: string;
  description: string;
  imagePath: string;
  ingredients: IRecipeIngredient[];
  favorite: boolean;
  tags: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRecipeDocument extends IRecipe, Document {
  _id: mongoose.Types.ObjectId;
}

const RecipeSchema = new Schema<IRecipeDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    imagePath: {
      type: String,
      default: "",
    },
    ingredients: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        amount: {
          type: Number,
          default: 0,
        },
      },
    ],
    favorite: {
      type: Boolean,
      default: false,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

RecipeSchema.index({ createdBy: 1, name: 1 });
RecipeSchema.index({ createdBy: 1, favorite: 1, updatedAt: -1 });

let Recipe: Model<IRecipeDocument>;

if ((mongoose.models as any).Recipe) {
  Recipe = mongoose.models.Recipe as Model<IRecipeDocument>;
} else {
  Recipe = mongoose.model<IRecipeDocument>("Recipe", RecipeSchema);
}

export { Recipe };
