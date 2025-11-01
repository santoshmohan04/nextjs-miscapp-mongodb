import {
  LOGIN_FAILURE,
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGOUT_FAILURE,
  LOGOUT_REQUEST,
  LOGOUT_SUCCESS,
  REGISTER_FAILURE,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
} from "./authtypes";
import axios from "axios";
import { Dispatch } from "redux";

// LOGIN
export const loginRequest =
  (email: string, password: string) => async (dispatch: Dispatch) => {
    try {
      dispatch({ type: LOGIN_REQUEST });

      const { data } = await axios.post(
        `api/auth/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );

      if (data.message === "Login successful" && data.user) {
        const { password: _pw, ...safeUser } = data.user;

        localStorage.setItem("loginUser", JSON.stringify(safeUser));

        dispatch({ type: LOGIN_SUCCESS, payload: safeUser });
      } else {
        dispatch({
          type: LOGIN_FAILURE,
          payload: data.message || "Unexpected response",
        });
      }
    } catch (error: any) {
      dispatch({
        type: LOGIN_FAILURE,
        payload: error.response?.data?.message || "Login failed",
      });
    }
  };

// REGISTER
export const registerUser =
  (name: string, email: string, password: string) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch({ type: REGISTER_REQUEST });

      const { data } = await axios.post(
        `api/auth/signup`,
        {
          name,
          email,
          password,
        },
        { withCredentials: true }
      );

      if (data.message === "User created successfully" && data.user) {
        const { password: _pw, ...safeUser } = data.user;

        localStorage.setItem("loginUser", JSON.stringify(safeUser));

        dispatch({ type: REGISTER_SUCCESS, payload: safeUser });
      } else {
        dispatch({
          type: REGISTER_FAILURE,
          payload: data.message || "Unexpected response",
        });
      }
    } catch (error: any) {
      dispatch({
        type: REGISTER_FAILURE,
        payload: error.response?.data?.message || "Registration failed",
      });
    }
  };

// LOGOUT
export const logoutUser = (router: any) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: LOGOUT_REQUEST });

    await axios.post(`api/auth/logout`, {}, { withCredentials: true });

    localStorage.removeItem("loginUser");

    dispatch({ type: LOGOUT_SUCCESS });
    router.push("/login");
  } catch (error: any) {
    dispatch({
      type: LOGOUT_FAILURE,
      payload: error.response?.data?.message || "Logout failed",
    });
  }
};
