import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

// UI State Interface
export interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  globalLoading: boolean;
}

// Initial state
const initialState: UIState = {
  sidebarOpen: false,
  theme: "light",
  globalLoading: false,
};

// UI Slice
const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Sidebar actions
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },

    // Theme actions
    toggleTheme: (state) => {
      state.theme = state.theme === "light" ? "dark" : "light";
    },
    setTheme: (state, action: PayloadAction<"light" | "dark">) => {
      state.theme = action.payload;
    },

    // Global loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },
  },
});

// Export actions
export const {
  toggleSidebar,
  setSidebarOpen,
  toggleTheme,
  setTheme,
  setGlobalLoading,
} = uiSlice.actions;

// Export reducer
export default uiSlice.reducer;
