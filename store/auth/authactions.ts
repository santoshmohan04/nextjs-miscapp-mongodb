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

import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebaseConfig";

const unwrapApiData = <T = any>(responseData: any): T => {
  if (responseData && typeof responseData === "object" && "data" in responseData) {
    return responseData.data as T;
  }

  return responseData as T;
};

const getApiErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.error?.message ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

/* -------------------------------------------------------------------------- */
/*                               LOGIN ACTION                                  */
/* -------------------------------------------------------------------------- */
export const loginRequest =
  (email: string, password: string) => async (dispatch: Dispatch) => {
    try {
      dispatch({ type: LOGIN_REQUEST });

      const { data } = await axios.post(
        `/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const payload = unwrapApiData<{ message?: string; user?: any }>(data);

      if (payload?.user) {
        const { password: _pw, ...safeUser } = payload.user;

        localStorage.setItem("loginUser", JSON.stringify(safeUser));

        dispatch({ type: LOGIN_SUCCESS, payload: safeUser });
      } else {
        dispatch({
          type: LOGIN_FAILURE,
          payload: payload?.message || "Unexpected login response",
        });
      }
    } catch (error: any) {
      dispatch({
        type: LOGIN_FAILURE,
        payload: getApiErrorMessage(error, "Login failed"),
      });
    }
  };

/* -------------------------------------------------------------------------- */
/*                              REGISTER ACTION                                */
/* -------------------------------------------------------------------------- */
export const registerUser =
  (name: string, email: string, password: string) =>
  async (dispatch: Dispatch) => {
    try {
      dispatch({ type: REGISTER_REQUEST });

      const { data } = await axios.post(
        `/api/auth/signup`,
        { name, email, password },
        { withCredentials: true }
      );

      const payload = unwrapApiData<{ message?: string; user?: any }>(data);

      if (payload?.user) {
        const { password: _pw, ...safeUser } = payload.user;

        localStorage.setItem("loginUser", JSON.stringify(safeUser));

        dispatch({ type: REGISTER_SUCCESS, payload: safeUser });
      } else {
        dispatch({
          type: REGISTER_FAILURE,
          payload: payload?.message || "Unexpected registration response",
        });
      }
    } catch (error: any) {
      dispatch({
        type: REGISTER_FAILURE,
        payload: getApiErrorMessage(error, "Registration failed"),
      });
    }
  };

/* -------------------------------------------------------------------------- */
/*                                 LOGOUT                                      */
/* -------------------------------------------------------------------------- */
export const logoutUser = (router: any) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: LOGOUT_REQUEST });

    await axios.post(`/api/auth/logout`, {}, { withCredentials: true });

    localStorage.removeItem("loginUser");

    dispatch({ type: LOGOUT_SUCCESS });
    router.push("/auth");
  } catch (error: any) {
    dispatch({
      type: LOGOUT_FAILURE,
      payload: getApiErrorMessage(error, "Logout failed"),
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                           UPLOAD PROFILE PICTURE                             */
/* -------------------------------------------------------------------------- */
export const uploadProfilePic = (file: File) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: UPLOAD_PROFILEPIC_REQUEST });

    const fileRef = ref(storage, `profilepics/${Date.now()}-${file.name}`);
    const snapshot = await uploadBytes(fileRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);

    await axios.put(
      `/api/profile/update-profile-pic`,
      { profilepic: downloadURL },
      { withCredentials: true }
    );

    dispatch({
      type: UPLOAD_PROFILEPIC_SUCCESS,
      payload: { profilepic: downloadURL },
    });

    const storedUser = JSON.parse(localStorage.getItem("loginUser") || "{}");
    storedUser.profilepic = downloadURL;
    localStorage.setItem("loginUser", JSON.stringify(storedUser));
  } catch (error: any) {
    dispatch({
      type: UPLOAD_PROFILEPIC_FAILURE,
      payload: getApiErrorMessage(error, "Profile pic update failed"),
    });
  }
};

/* -------------------------------------------------------------------------- */
/*                              CHANGE PASSWORD                                */
/* -------------------------------------------------------------------------- */
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

      const payload = unwrapApiData<{ message?: string }>(data);

      dispatch({
        type: CHANGE_PASSWORD_SUCCESS,
        payload: payload?.message,
      });

      return payload?.message;
    } catch (error: any) {
      const message = getApiErrorMessage(error, "Password update failed");
      dispatch({
        type: CHANGE_PASSWORD_FAILURE,
        payload: message,
      });
      throw new Error(message);
    }
  };

export const clearPasswordMessages = () => (dispatch: Dispatch) =>
  dispatch({ type: CLEAR_PASSWORD_MESSAGES });

/* -------------------------------------------------------------------------- */
/*                           RESTORE SESSION (Persist Login)                   */
/* -------------------------------------------------------------------------- */
export const restoreSession = () => async (dispatch: Dispatch) => {
  try {
    const res = await fetch("/api/auth/me", {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Not logged in");

    const responseData = await res.json();
    const payload = unwrapApiData<{ user?: any }>(responseData);
    const { user } = payload || {};

    if (!user) throw new Error("Invalid session");

    dispatch({ type: LOGIN_SUCCESS, payload: user });

    localStorage.setItem("loginUser", JSON.stringify(user));
  } catch {
    dispatch({ type: LOGOUT_SUCCESS });
    localStorage.removeItem("loginUser");
  }
};
