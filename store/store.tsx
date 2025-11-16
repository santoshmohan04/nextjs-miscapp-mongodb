// store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authreducers";
import recipeReducer from "./recipies/recipiesreducers";
import authUsersReducer from "./authusers/authusersreducers";
import bookmarksReducer from "./bookmarks/reducers";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    recipes: recipeReducer,
    authUsers: authUsersReducer,
    bookmarks: bookmarksReducer
  },
  // middleware like redux-thunk is included by default
});

// TypeScript types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
