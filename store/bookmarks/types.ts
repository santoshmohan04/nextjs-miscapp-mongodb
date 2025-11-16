export interface Bookmark {
  _id: string;
  title: string;
  link: string;
  description: string;
  category: string;
  thumbnail?: string;
  favorite?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


// Bookmark Types
export const FETCH_BOOKMARKS = "FETCH_BOOKMARKS";
export const FETCH_BOOKMARKS_SUCCESS = "FETCH_BOOKMARKS_SUCCESS";
export const FETCH_BOOKMARKS_FAIL = "FETCH_BOOKMARKS_FAIL";

export const ADD_BOOKMARK = "ADD_BOOKMARK";
export const ADD_BOOKMARK_SUCCESS = "ADD_BOOKMARK_SUCCESS";
export const ADD_BOOKMARK_FAIL = "ADD_BOOKMARK_FAIL";

export const UPDATE_BOOKMARK = "UPDATE_BOOKMARK";
export const UPDATE_BOOKMARK_SUCCESS = "UPDATE_BOOKMARK_SUCCESS";
export const UPDATE_BOOKMARK_FAIL = "UPDATE_BOOKMARK_FAIL";

export const DELETE_BOOKMARK = "DELETE_BOOKMARK";
export const DELETE_BOOKMARK_SUCCESS = "DELETE_BOOKMARK_SUCCESS";
export const DELETE_BOOKMARK_FAIL = "DELETE_BOOKMARK_FAIL";

export const SEARCH_BOOKMARKS = "SEARCH_BOOKMARKS";
export const TOGGLE_FAVORITE = "TOGGLE_FAVORITE"; // ⭐ Add favorite toggle
