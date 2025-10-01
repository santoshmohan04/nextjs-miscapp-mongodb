import {
  FETCH_BOOKMARKS_LIST,
  ADD_BOOKMARK_REQUEST,
  ADD_CATEGORY_REQUEST,
  DELETE_BOOKMARK_REQUEST,
  SEARCH_BOOKMARKS_REQUEST,
} from "./types";
import { bookmarksdata } from "@/components/data";

const folders = () => {
  return bookmarksdata.flatMap((folder) =>
    folder.children.map((child) => ({ ...child, folderTitle: folder.title }))
  );
};

type Bookmark = {
  id: string;
  title?: string;
  [key: string]: any;
};

type State = {
  bookmarkslist: Bookmark[] | null;
  itemsPerPage: number;
  currentPage: number;
  searchterm: string;
  categories: any[] | null;
};

const initialState: State = {
  bookmarkslist: null,
  itemsPerPage: 6,
  currentPage: 1,
  searchterm: "",
  categories: null,
};

const reducer = (state: State = initialState, action: any) => {
  switch (action.type) {
    case FETCH_BOOKMARKS_LIST:
      return {
        ...state,
        bookmarkslist: folders(),
      };
    case ADD_BOOKMARK_REQUEST:
      return {
        ...state,
        bookmarkslist: state.bookmarkslist
          ? [...state.bookmarkslist, action.payload]
          : [action.payload],
      };
    case ADD_CATEGORY_REQUEST:
      return {
        ...state,
        categories: state.categories
          ? [...state.categories, action.payload]
          : [action.payload],
      };
    case DELETE_BOOKMARK_REQUEST:
      return {
        ...state,
        bookmarkslist: state.bookmarkslist
          ? state.bookmarkslist.filter(
              (bookmark: any) => bookmark.id !== action.payload.id
            )
          : [],
      };
    case SEARCH_BOOKMARKS_REQUEST:
      return {
        ...state,
        bookmarkslist: state.bookmarkslist
          ? state.bookmarkslist.filter((bookmark: any) =>
              bookmark.title
                ?.toLowerCase()
                .includes(action.payload.toLowerCase())
            )
          : [],
      };
    default:
      return state;
  }
};

export default reducer;
