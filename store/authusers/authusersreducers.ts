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

interface AuthUser {
  _id: string;
  name: string;
  email: string;
  profilepic?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthUsersState {
  users: AuthUser[];
  meta?: { total: number; page: number; limit: number };
  loading: boolean;
  error: string | null;
}

const initialState: AuthUsersState = {
  users: [],
  loading: false,
  error: null,
};

const authUsersReducer = (
  state = initialState,
  action: any
): AuthUsersState => {
  switch (action.type) {
    case FETCH_AUTHUSERS:
      return { ...state, loading: true, error: null };
    case FETCH_AUTHUSERS_SUCCESS:
      return {
        ...state,
        loading: false,
        users: action.payload.data,
        meta: action.payload.meta,
      };
    case FETCH_AUTHUSERS_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case ADD_AUTHUSER:
      return { ...state, loading: true, error: null };
    case ADD_AUTHUSER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: [action.payload, ...state.users],
      };
    case ADD_AUTHUSER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case UPDATE_AUTHUSER:
      return { ...state, loading: true, error: null };
    case UPDATE_AUTHUSER_SUCCESS:
      return {
        ...state,
        users: state.users.map((u) =>
          u._id === action.payload._id ? { ...u, ...action.payload } : u
        ),
      };
    case UPDATE_AUTHUSER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    case REMOVE_AUTHUSER:
      return { ...state, loading: true, error: null };
    case REMOVE_AUTHUSER_SUCCESS:
      return {
        ...state,
        loading: false,
        users: state.users.filter((u) => u._id !== action.payload),
      };
    case REMOVE_AUTHUSER_FAILURE:
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default authUsersReducer;
