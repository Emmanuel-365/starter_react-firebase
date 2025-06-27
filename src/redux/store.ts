import { configureStore } from '@reduxjs/toolkit';
import mailReducer from './mailSlice'; // Import the mail reducer
import familyReducer from './familySlice'; // Importer le nouveau reducer pour les familles

export const store = configureStore({
  reducer: {
    mail: mailReducer, // Add the mail reducer to the store
    family: familyReducer, // Ajouter le reducer de famille ici
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    // Firebase Timestamps sont non-sériables.
    // Il est préférable de les transformer en string ISO ou en millisecondes avant de les stocker dans Redux.
    // Désactivation globale de la vérification de sérialisabilité pour simplifier, mais à manier avec prudence.
    serializableCheck: false, 
  }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

console.log('Redux store configured with familySlice.'); // Optional: for development confirmation
