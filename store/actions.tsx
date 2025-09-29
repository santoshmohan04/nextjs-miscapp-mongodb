import {
  FETCH_BOOKMARKS_LIST,
  ADD_BOOKMARK_REQUEST,
  ADD_CATEGORY_REQUEST,
  DELETE_BOOKMARK_REQUEST,
  SEARCH_BOOKMARKS_REQUEST,
} from './types';

interface bookmarkPayload {
  title: string;
  url: string;
  icon: string;
  foldertitle: string;
}

export const bookmarksList = (data: any) => {
  return {
    type: FETCH_BOOKMARKS_LIST,
    payload: data
  }
}

export const addBookmark = (payload: bookmarkPayload) => {
  return {
    type: ADD_BOOKMARK_REQUEST,
    payload: payload,
  };
};

export const addCategory = (title: string) => {
  return {
    type: ADD_CATEGORY_REQUEST,
    payload: title,
  };
};

export const deleteBookmark = (payload: any) => {
  return {
    type: DELETE_BOOKMARK_REQUEST,
    payload: payload,
  };
};

export const searchBookmark = (data: string) => {
  return {
    type: SEARCH_BOOKMARKS_REQUEST,
    payload: data,
  };
};
