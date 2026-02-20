import axios from "axios";
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
} from "./types";

// 🔍 Search Bookmark
export const searchBookmarks = (keyword: string) => ({
  type: SEARCH_BOOKMARKS,
  payload: keyword,
});

// ⭐ Toggle Favorite Bookmark
export const toggleFavorite = (id: string) => ({
  type: TOGGLE_FAVORITE,
  payload: id,
});

// 📌 Fetch Bookmarks
export const fetchBookmarks = (page = 1, limit = 10, search = "") => {
  return async (dispatch: any) => {
    dispatch({ type: FETCH_BOOKMARKS });

    try {
      const res = await axios.get(`/api/bookmarks?page=${page}&limit=${limit}&search=${search}`);
      dispatch({
        type: FETCH_BOOKMARKS_SUCCESS,
        payload: res.data,
      });
    } catch (error: any) {
      dispatch({
        type: FETCH_BOOKMARKS_FAIL,
        payload: error.message,
      });
    }
  };
};

// ➕ Add Bookmark
export const addBookmark = (data: any) => {
  return async (dispatch: any) => {
    dispatch({ type: ADD_BOOKMARK });

    try {
      const res = await axios.post("/api/bookmarks", data);
      dispatch({
        type: ADD_BOOKMARK_SUCCESS,
        payload: res.data,
      });
    } catch (error: any) {
      dispatch({
        type: ADD_BOOKMARK_FAIL,
        payload: error.message,
      });
    }
  };
};

// ✏ Update Bookmark
export const updateBookmark = (id: string, data: any) => {
  return async (dispatch: any) => {
    dispatch({ type: UPDATE_BOOKMARK });

    try {
      const res = await axios.put(`/api/bookmarks/${id}`, data);
      dispatch({
        type: UPDATE_BOOKMARK_SUCCESS,
        payload: res.data,
      });
    } catch (error: any) {
      dispatch({
        type: UPDATE_BOOKMARK_FAIL,
        payload: error.message,
      });
    }
  };
};

// 🗑 Delete Bookmark
export const deleteBookmark = (id: string) => {
  return async (dispatch: any) => {
    dispatch({ type: DELETE_BOOKMARK });

    try {
      await axios.delete(`/api/bookmarks/${id}`);
      dispatch({
        type: DELETE_BOOKMARK_SUCCESS,
        payload: id,
      });
    } catch (error: any) {
      dispatch({
        type: DELETE_BOOKMARK_FAIL,
        payload: error.message,
      });
    }
  };
};