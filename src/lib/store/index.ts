import { configureStore } from "@reduxjs/toolkit";
import uiReducer from "./slices/ui";

// Configure Redux store
export const store = configureStore({
  reducer: {
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // Configure serializable check to ignore non-serializable values
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE"],
      },
      // Enable immutable check in development
      immutableCheck: import.meta.env.DEV,
    }),
  // Enable Redux DevTools in development
  devTools: import.meta.env.DEV,
});

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export store instance
export default store;
