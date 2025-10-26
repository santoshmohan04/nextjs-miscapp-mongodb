// pages API wrapper for individual recipe operations
import { connectDB } from "../../../../lib/mongodb";
import { Recipe } from "../../../../models/Recipe";

export default async function handler(req: any, res: any) {
  const {
    query: { id },
    method,
  } = req;

  try {
    await connectDB();

    if (method === "PUT") {
      try {
        const updatedRecipe = await Recipe.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!updatedRecipe) return res.status(404).json({ error: "Recipe not found" });
        return res.status(200).json(updatedRecipe);
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    if (method === "DELETE") {
      try {
        const deletedRecipe = await Recipe.findByIdAndDelete(id);
        if (!deletedRecipe) return res.status(404).json({ error: "Recipe not found" });
        return res.status(200).json({ message: "Recipe deleted", recipe: deletedRecipe });
      } catch (err: any) {
        return res.status(500).json({ error: err.message });
      }
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
