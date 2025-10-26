// pages API wrapper for recipes — uses pages/api handler signature
import { connectDB } from "../../../lib/mongodb";
import { Recipe } from "../../../models/Recipe";

export default async function handler(req: any, res: any) {
  try {
    await connectDB();
    if (req.method === "POST") {
      const body = req.body;
      const recipe = new Recipe(body);
      await recipe.save();
      return res.status(201).json(recipe);
    }

    if (req.method === "GET") {
      const recipes = await Recipe.find();
      return res.status(200).json(recipes);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
