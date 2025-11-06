import axios from "axios";
import { Dispatch } from "redux";
import {
  FETCH_AUTHUSERS,
  FETCH_AUTHUSERS_SUCCESS,
  FETCH_AUTHUSERS_FAILURE,
  ADD_AUTHUSER,
  ADD_AUTHUSER_SUCCESS,
  ADD_AUTHUSER_FAILURE,
  UPDATE_AUTHUSER,
  UPDATE_AUTHUSER_SUCCESS,
  UPDATE_AUTHUSER_FAILURE,
  REMOVE_AUTHUSER,
  REMOVE_AUTHUSER_SUCCESS,
  REMOVE_AUTHUSER_FAILURE,
} from "./authuserstypes";

// 🔹 FETCH all Auth Users (with pagination + search)
export const fetchAuthUsers =
  (page = 1, limit = 12, q = "") =>
  async (dispatch: Dispatch) => {
    try {
      dispatch({ type: FETCH_AUTHUSERS });
      const response = await axios.get(
        `/api/authusers?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`,
        { withCredentials: true }
      );
      dispatch({ type: FETCH_AUTHUSERS_SUCCESS, payload: response.data });
    } catch (error: any) {
      dispatch({ type: FETCH_AUTHUSERS_FAILURE, payload: error.message });
    }
  };

// 🔹 ADD new Auth User
export const addAuthUser =
  (userData: {
    name: string;
    email: string;
    password: string;
    profilePic?: string;
  }) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch({ type: ADD_AUTHUSER });
      const response = await axios.post(`/api/authusers`, userData, {
        withCredentials: true,
      });
      dispatch({ type: ADD_AUTHUSER_SUCCESS, payload: response.data });
    } catch (error: any) {
      dispatch({ type: ADD_AUTHUSER_FAILURE, payload: error.message });
    }
  };

// 🔹 UPDATE existing Auth User
export const updateAuthUser =
  (id: string, updatedData: any) => async (dispatch: Dispatch) => {
    try {
      dispatch({ type: UPDATE_AUTHUSER });
      const response = await axios.put(`/api/authusers/${id}`, updatedData, {
        withCredentials: true,
      });
      dispatch({ type: UPDATE_AUTHUSER_SUCCESS, payload: response.data });
    } catch (error: any) {
      dispatch({ type: UPDATE_AUTHUSER_FAILURE, payload: error.message });
    }
  };

// 🔹 REMOVE Auth User
export const removeAuthUser = (id: string) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: REMOVE_AUTHUSER });
    await axios.delete(`/api/authusers/${id}`, { withCredentials: true });
    dispatch({ type: REMOVE_AUTHUSER_SUCCESS, payload: id });
  } catch (error: any) {
    dispatch({ type: REMOVE_AUTHUSER_FAILURE, payload: error.message });
  }
};
