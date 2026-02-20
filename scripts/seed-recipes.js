const mongoose = require("mongoose");
const { loadEnvConfig } = require("@next/env");

loadEnvConfig(process.cwd());

const userId = process.argv[2];

if (!userId) {
  console.error("Usage: node scripts/seed-recipes.js <userId>");
  process.exit(1);
}

if (!mongoose.Types.ObjectId.isValid(userId)) {
  console.error("Invalid userId provided.");
  process.exit(1);
}

const recipeSchema = new mongoose.Schema(
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
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthUser",
      required: true,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    password: { type: String, select: false },
    profilepic: String,
  },
  { timestamps: true }
);

const Recipe = mongoose.models.Recipe || mongoose.model("Recipe", recipeSchema);
const AuthUser = mongoose.models.AuthUser || mongoose.model("AuthUser", userSchema);

const recipeNames = [
  "Classic Margherita Pizza",
  "Paneer Butter Masala",
  "Vegetable Fried Rice",
  "Spaghetti Aglio e Olio",
  "Tomato Basil Soup",
  "Chickpea Salad Bowl",
  "Lemon Garlic Pasta",
  "Mushroom Risotto",
  "Veggie Burrito",
  "Thai Green Curry",
  "Masala Dosa",
  "Aloo Paratha",
  "Veg Pulao",
  "Palak Paneer",
  "Schezwan Noodles",
  "Mexican Bean Tacos",
  "Quinoa Veg Stir Fry",
  "Mediterranean Couscous",
  "Pumpkin Soup",
  "Grilled Veg Sandwich",
  "Spinach Corn Pasta",
  "Rajma Masala",
  "Chole Bhature",
  "Vegetable Korma",
  "Pesto Penne",
  "Veggie Momos",
  "Loaded Nachos",
  "Oats Upma",
  "Tofu Stir Fry",
  "Herb Roasted Potatoes",
];

function buildRecipes(createdBy) {
  return recipeNames.map((name, index) => ({
    name,
    description: `${name} - delicious homemade recipe #${index + 1}.`,
    imagePath: `https://picsum.photos/seed/recipe-${index + 1}/600/400`,
    ingredients: [
      { name: "Main ingredient", amount: index + 1 },
      { name: "Salt", amount: 1 },
      { name: "Oil", amount: 2 },
      { name: "Spices", amount: 1 },
    ],
    createdBy,
  }));
}

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_CONNECTION_STRING;
    if (!mongoUri) {
      throw new Error("MONGODB_CONNECTION_STRING is missing in environment.");
    }

    await mongoose.connect(mongoUri);

    const user = await AuthUser.findById(userId);
    if (!user) {
      throw new Error(`User not found for id: ${userId}`);
    }

    const existing = await Recipe.find({ createdBy: user._id }).select("name");
    const existingNames = new Set(existing.map((item) => item.name));

    const candidateRecipes = buildRecipes(user._id);
    const recipesToInsert = candidateRecipes.filter(
      (recipe) => !existingNames.has(recipe.name)
    );

    if (recipesToInsert.length) {
      await Recipe.insertMany(recipesToInsert);
    }

    const totalForUser = await Recipe.countDocuments({ createdBy: user._id });

    console.log(
      JSON.stringify(
        {
          userId,
          userEmail: user.email,
          inserted: recipesToInsert.length,
          totalRecipesForUser: totalForUser,
        },
        null,
        2
      )
    );
  } catch (error) {
    console.error(error.message || error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seed();
