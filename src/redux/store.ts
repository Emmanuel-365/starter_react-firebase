import { configureStore } from '@reduxjs/toolkit';
import mailReducer from './mailSlice'; // Import the mail reducer

export const store = configureStore({
  reducer: {
    mail: mailReducer, // Add the mail reducer to the store
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

console.log('Redux store configured.'); // Optional: for development confirmation
