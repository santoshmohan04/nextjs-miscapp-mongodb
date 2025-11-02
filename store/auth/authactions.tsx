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
  UPLOAD_PROFILEPIC_REQUEST,
  UPLOAD_PROFILEPIC_SUCCESS,
  UPLOAD_PROFILEPIC_FAILURE,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  CLEAR_PASSWORD_MESSAGES,
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

// ✅ UPLOAD PROFILE PIC
export const uploadProfilePic =
  (file: File) => async (dispatch: Dispatch, getState: any) => {
    try {
      dispatch({ type: UPLOAD_PROFILEPIC_REQUEST });

      const formData = new FormData();
      formData.append("file", file);

      const { data } = await axios.post(`/api/profile/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      // The API returns { url: "/uploads/filename.png" }
      const newPicUrl = data.url;

      // Get current user from Redux / localStorage
      const currentUser =
        getState().auth.user ||
        JSON.parse(localStorage.getItem("loginUser") || "{}");
      const updatedUser = { ...currentUser, profilepic: newPicUrl };

      // Persist updated user
      localStorage.setItem("loginUser", JSON.stringify(updatedUser));

      dispatch({
        type: UPLOAD_PROFILEPIC_SUCCESS,
        payload: updatedUser,
      });
    } catch (error: any) {
      dispatch({
        type: UPLOAD_PROFILEPIC_FAILURE,
        payload:
          error.response?.data?.message || "Profile picture upload failed",
      });
    }
  };

  // ✅ CHANGE PASSWORD ACTION
export const changePassword =
  (currentPassword: string, newPassword: string, confirmPassword: string) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch({ type: CHANGE_PASSWORD_REQUEST });

      const { data } = await axios.post(
        "/api/auth/change-password",
        { currentPassword, newPassword, confirmPassword },
        { withCredentials: true }
      );

      dispatch({
        type: CHANGE_PASSWORD_SUCCESS,
        payload: data.message,
      });

      return data.message;
    } catch (error: any) {
      dispatch({
        type: CHANGE_PASSWORD_FAILURE,
        payload: error.response?.data?.error || "Password update failed",
      });
      throw new Error(error.response?.data?.error || "Password update failed");
    }
  };

// ✅ CLEAR PASSWORD MESSAGES ACTION
export const clearPasswordMessages = () => (dispatch: Dispatch) => {
  dispatch({ type: CLEAR_PASSWORD_MESSAGES });
};