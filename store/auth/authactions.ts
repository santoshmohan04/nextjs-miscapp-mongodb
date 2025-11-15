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

// UPLOAD PROFILE PIC
export const uploadProfilePic = (file: File) => async (dispatch: Dispatch) => {
  try {
    dispatch({ type: UPLOAD_PROFILEPIC_REQUEST });

    // 🔹 Create reference in Firebase
    const fileRef = ref(storage, `profilepics/${Date.now()}-${file.name}`);

    // 🔹 Upload to Firebase
    const snapshot = await uploadBytes(fileRef, file);

    // 🔹 Fetch image download URL
    const downloadURL = await getDownloadURL(snapshot.ref);

    // OPTIONAL: store URL in your backend database
    await axios.put(
      `/api/profile/update-profile-pic`,
      { profilepic: downloadURL },
      { withCredentials: true }
    );

    // 🔹 Dispatch success to Redux
    dispatch({
      type: UPLOAD_PROFILEPIC_SUCCESS,
      payload: { profilepic: downloadURL },
    });

    // 🔹 Update localStorage user
    const storedUser = JSON.parse(localStorage.getItem("loginUser") || "{}");
    storedUser.profilepic = downloadURL;
    localStorage.setItem("loginUser", JSON.stringify(storedUser));
  } catch (error: any) {
    dispatch({
      type: UPLOAD_PROFILEPIC_FAILURE,
      payload: error.response?.data?.error || error.message,
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