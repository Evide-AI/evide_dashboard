import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface UIState {
  sidebarOpen: boolean;
  globalLoading: boolean;
  modals: {
    createBus: boolean;
    createRoute: boolean;
  };
}

// Initial state
const initialState: UIState = {
  sidebarOpen: false,
  globalLoading: false,
  modals: {
    createBus: false,
    createRoute: false,
  },
};

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

    // Global loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.globalLoading = action.payload;
    },

    // Modal actions
    openCreateBusModal: (state) => {
      state.modals.createBus = true;
    },
    closeCreateBusModal: (state) => {
      state.modals.createBus = false;
    },

    openCreateRouteModal: (state) => {
      state.modals.createRoute = true;
    },
    closeCreateRouteModal: (state) => {
      state.modals.createRoute = false;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setGlobalLoading,
  openCreateBusModal,
  closeCreateBusModal,
  openCreateRouteModal,
  closeCreateRouteModal,
} = uiSlice.actions;

export default uiSlice.reducer;
