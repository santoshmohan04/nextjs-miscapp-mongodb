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
import axios from "axios";
import { Dispatch } from "redux";

// FETCH RECIPES
export const fetchRecipes = () => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: FETCH_RECIPES });
    const response = await axios.get(`api/recipes`, { withCredentials: true });
    dispatch({ type: FETCH_RECIPES_SUCCESS, payload: response.data });
  } catch (error: any) {
    dispatch({ type: FETCH_RECIPES_FAILURE, payload: error.message });
  }
};

// ADD RECIPE
export const addRecipe =
  (recipeData: {
    name: string;
    description: string;
    imagePath: string;
    ingredients: { name: string; amount: number }[];
  }) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch({ type: ADD_RECIPE });
      const response = await axios.post(`api/recipes`, recipeData, { withCredentials: true });
      dispatch({ type: ADD_RECIPE_SUCCESS, payload: response.data });
    } catch (error: any) {
      dispatch({ type: ADD_RECIPE_FAILURE, payload: error.message });
    }
  };

// REMOVE RECIPE
export const removeRecipe = (id: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: REMOVE_RECIPE });
    await axios.delete(`api/recipes/${id}`, { withCredentials: true });
    dispatch({ type: REMOVE_RECIPE_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({ type: REMOVE_RECIPE_FAILURE, payload: error.message });
  }
};

// UPDATE RECIPE
export const updateRecipe =
  (
    id: string,
    updatedData: {
      name: string;
      description: string;
      imagePath: string;
      ingredients: { name: string; amount: number }[];
    }
  ) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch({ type: UPDATE_RECIPE });
      const response = await axios.put(`api/recipes/${id}`, updatedData, { withCredentials: true });
      dispatch({ type: UPDATE_RECIPE_SUCCESS, payload: response.data });
    } catch (error: any) {
      dispatch({ type: UPDATE_RECIPE_FAILURE, payload: error.message });
    }
  };
