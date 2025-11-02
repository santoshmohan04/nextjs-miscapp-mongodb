import { Document } from "mongoose";
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
  UPLOAD_PROFILEPIC_FAILURE,
  UPLOAD_PROFILEPIC_REQUEST,
  UPLOAD_PROFILEPIC_SUCCESS,
  CHANGE_PASSWORD_REQUEST,
  CHANGE_PASSWORD_SUCCESS,
  CHANGE_PASSWORD_FAILURE,
  CLEAR_PASSWORD_MESSAGES,
} from "./authtypes";

export interface IAuthUser extends Document {
  name: string;
  email: string;
  password: string;
  profilepic?: string;
  createdAt: string;
  updatedAt: string;
}

type AuthState = {
  isAuthenticated: boolean;
  user: IAuthUser | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
};

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null,
  successMessage: null,
};

const authReducer = (state = initialState, action: any): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LOGIN_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };

    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case LOGOUT_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case LOGOUT_SUCCESS:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };

    case LOGOUT_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case REGISTER_REQUEST:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case REGISTER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        loading: false,
        error: null,
      };

    case REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case UPLOAD_PROFILEPIC_REQUEST:
      return { ...state, loading: true, error: null };

    case UPLOAD_PROFILEPIC_SUCCESS:
      return { ...state, loading: false, user: action.payload };

    case UPLOAD_PROFILEPIC_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case CHANGE_PASSWORD_REQUEST:
      return { ...state, loading: true, error: null, successMessage: null };

    case CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
        loading: false,
        successMessage: action.payload,
        error: null,
      };

    case CHANGE_PASSWORD_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        successMessage: null,
      };

    case CLEAR_PASSWORD_MESSAGES:
      return {
        ...state,
        successMessage: null,
        error: null,
      };

    default:
      return state;
  }
};

export default authReducer;
