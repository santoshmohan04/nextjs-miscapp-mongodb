import {
  FETCH_BOOKMARKS,
  FETCH_BOOKMARKS_SUCCESS,
  FETCH_BOOKMARKS_FAIL,
  ADD_BOOKMARK,
  ADD_BOOKMARK_SUCCESS,
  ADD_BOOKMARK_FAIL,
  UPDATE_BOOKMARK,
  UPDATE_BOOKMARK_SUCCESS,
  UPDATE_BOOKMARK_FAIL,
  DELETE_BOOKMARK,
  DELETE_BOOKMARK_SUCCESS,
  DELETE_BOOKMARK_FAIL,
  SEARCH_BOOKMARKS,
  TOGGLE_FAVORITE,
  Bookmark,
} from "./types";

interface BookmarkState {
  list: Bookmark[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  meta: {
    total: number;
    page: number;
    limit: number;
  };
}

const initialState: BookmarkState = {
  list: [],
  loading: false,
  error: null,
  searchTerm: "",
  meta: {
    total: 0,
    page: 1,
    limit: 10,
  },
};

export default function bookmarksReducer(state = initialState, action: any) {
  switch (action.type) {
    /**
     * FETCH
     */
    case FETCH_BOOKMARKS:
      return { ...state, loading: true, error: null };

    case FETCH_BOOKMARKS_SUCCESS:
      return {
        ...state,
        loading: false,
        list: Array.isArray(action.payload) ? action.payload : [], // ✅ safe
        meta: action.payload.meta || state.meta,
      };

    case FETCH_BOOKMARKS_FAIL:
      return { ...state, loading: false, error: action.payload };

    /**
     * CREATE
     */
    case ADD_BOOKMARK:
      return { ...state, loading: true };

    case ADD_BOOKMARK_SUCCESS:
      return {
        ...state,
        loading: false,
        list: [action.payload, ...state.list], // prepend new item
        meta: { ...state.meta, total: state.meta.total + 1 }, // update total
      };

    case ADD_BOOKMARK_FAIL:
      return { ...state, loading: false, error: action.payload };

    /**
     * UPDATE
     */
    case UPDATE_BOOKMARK:
      return { ...state, loading: true };

    case UPDATE_BOOKMARK_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list.map((b: Bookmark) =>
          b._id === action.payload._id ? action.payload : b
        ),
      };

    case UPDATE_BOOKMARK_FAIL:
      return { ...state, loading: false, error: action.payload };

    /**
     * DELETE
     */
    case DELETE_BOOKMARK:
      return { ...state, loading: true };

    case DELETE_BOOKMARK_SUCCESS:
      return {
        ...state,
        loading: false,
        list: state.list.filter((b: Bookmark) => b._id !== action.payload),
        meta: { ...state.meta, total: state.meta.total - 1 },
      };

    case DELETE_BOOKMARK_FAIL:
      return { ...state, loading: false, error: action.payload };

    /**
     * SEARCH TERM (NO API CALL)
     */
    case SEARCH_BOOKMARKS:
      return { ...state, searchTerm: action.payload };

    /**
     * FAVORITE TOGGLE
     */
    case TOGGLE_FAVORITE:
      return {
        ...state,
        list: state.list.map((b: Bookmark) =>
          b._id === action.payload
            ? { ...b, favorite: !b.favorite }
            : b
        ),
      };

    default:
      return state;
  }
}