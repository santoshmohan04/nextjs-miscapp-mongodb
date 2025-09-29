import {
  FETCH_BOOKMARKS_LIST,
  ADD_BOOKMARK_REQUEST,
  ADD_CATEGORY_REQUEST,
  DELETE_BOOKMARK_REQUEST,
  SEARCH_BOOKMARKS_REQUEST,
} from './types';
import { bookmarksdata } from '@/components/data';

const folders = () => {
  return bookmarksdata.flatMap((folder) => folder.children.map((child) => ({ ...child, folderTitle: folder.title })));
}

const initialState = {
  bookmarkslist: null,
  itemsPerPage: 6,
  currentPage: 1,
  searchterm: '',
  categories: null
}

const reducer = (state = initialState, action:any) => {
  switch (action.type) {
    case FETCH_BOOKMARKS_LIST:
      return {
        ...state,
        bookmarkslist: folders()
      }
    case ADD_BOOKMARK_REQUEST:
      return {
        ...state,
        bookmarkslist:
      }
    case ADD_CATEGORY_REQUEST:
      return {
        ...state,
        categories:
      }
      case DELETE_BOOKMARK_REQUEST:
        return {
          ...state,
          bookmarkslist:
        }
        case SEARCH_BOOKMARKS_REQUEST:
          return {
            ...state,
            bookmarkslist:
          }
    default: return state
  }
}

export default reducer;