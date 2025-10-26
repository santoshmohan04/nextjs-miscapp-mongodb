import {
  ADD_RECIPE,
  ADD_RECIPE_SUCCESS,
  ADD_RECIPE_FAILURE,
  FETCH_RECIPES,
  FETCH_RECIPES_SUCCESS,
  FETCH_RECIPES_FAILURE,
  REMOVE_RECIPE,
  REMOVE_RECIPE_SUCCESS,
  REMOVE_RECIPE_FAILURE,
  UPDATE_RECIPE,
  UPDATE_RECIPE_SUCCESS,
  UPDATE_RECIPE_FAILURE,
} from "./recipiestypes";

export interface Ingredient {
  name: string;
  amount: number;
}

export interface Recipe {
  _id: string;                 // MongoDB ObjectId as string
  name: string;
  description: string;
  imagePath: string;
  ingredients: Ingredient[];
  createdAt: string;           // ISO date string
  updatedAt: string;           // ISO date string
  __v?: number;
  createdBy: string;           // User ObjectId as string
}

interface RecipeState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
}

const initialState: RecipeState = {
  recipes: [],
  loading: false,
  error: null,
};

const recipeReducer = (state = initialState, action: any): RecipeState => {
  switch (action.type) {
    case FETCH_RECIPES:
      return { ...state, loading: true, error: null };
    case FETCH_RECIPES_SUCCESS:
      return { ...state, loading: false, recipes: action.payload };
    case FETCH_RECIPES_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case ADD_RECIPE:
      return { ...state, loading: true, error: null };
    case ADD_RECIPE_SUCCESS:
      return { ...state, loading: false, recipes: [...state.recipes, action.payload] };
    case ADD_RECIPE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case REMOVE_RECIPE:
      return { ...state, loading: true, error: null };
    case REMOVE_RECIPE_SUCCESS:
      return { ...state, loading: false, recipes: state.recipes.filter(recipe => recipe._id !== action.payload) };
    case REMOVE_RECIPE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case UPDATE_RECIPE:
      return { ...state, loading: true, error: null };
    case UPDATE_RECIPE_SUCCESS:
      return {
        ...state,
        loading: false,
        recipes: state.recipes.map(recipe => (recipe._id === action.payload._id ? action.payload : recipe)),
      };
    case UPDATE_RECIPE_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default recipeReducer;
