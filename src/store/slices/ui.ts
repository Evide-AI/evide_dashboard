import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { BusDetailsTrip } from "../../types";

export interface UIState {
  sidebarOpen: boolean;
  globalLoading: boolean;
  modals: {
    createBus: boolean;
    createRoute: boolean;
    createTrip: boolean;
    busDetails: boolean;
    tripDetails: boolean;
  };
  creationFlow: {
    route: {
      fromBusCreation: boolean;
      linkedBusId: number | null;
      linkedBusNumber: string | null;
    };
    trip: {
      fromRouteCreation: boolean;
      linkedBusId: number | null;
      linkedBusNumber: string | null;
      linkedRouteId: number | null;
      linkedRouteName: string | null;
    };
  };
  selectedBusId: number | null;
  selectedTripData: BusDetailsTrip | null;
  
  // Edit mode state
  editMode: {
    busDetails: boolean;
    tripDetails: boolean;
  };
  unsavedChanges: {
    busDetails: boolean;
    tripDetails: boolean;
  };
  pendingNavigation: {
    from: 'busDetails' | 'tripDetails' | null;
    to: 'busDetails' | 'tripDetails' | null;
  };
}

// Initial state
const initialState: UIState = {
  sidebarOpen: false,
  globalLoading: false,
  modals: {
    createBus: false,
    createRoute: false,
    createTrip: false,
    busDetails: false,
    tripDetails: false,
  },
  creationFlow: {
    route: {
      fromBusCreation: false,
      linkedBusId: null,
      linkedBusNumber: null,
    },
    trip: {
      fromRouteCreation: false,
      linkedBusId: null,
      linkedBusNumber: null,
      linkedRouteId: null,
      linkedRouteName: null,
    },
  },
  selectedBusId: null,
  selectedTripData: null,
  editMode: {
    busDetails: false,
    tripDetails: false,
  },
  unsavedChanges: {
    busDetails: false,
    tripDetails: false,
  },
  pendingNavigation: {
    from: null,
    to: null,
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

    openCreateRouteModal: (
      state,
      action: PayloadAction<{ busId?: number; busNumber?: string } | undefined>
    ) => {
      state.modals.createRoute = true;
      if (action.payload?.busId) {
        state.creationFlow.route.fromBusCreation = true;
        state.creationFlow.route.linkedBusId = action.payload.busId;
        state.creationFlow.route.linkedBusNumber =
          action.payload.busNumber || null;
      }
    },
    closeCreateRouteModal: (state) => {
      state.modals.createRoute = false;
      // Reset route context
      state.creationFlow.route.fromBusCreation = false;
      state.creationFlow.route.linkedBusId = null;
      state.creationFlow.route.linkedBusNumber = null;
    },

    openCreateTripModal: (
      state,
      action: PayloadAction<
        | {
            busId?: number;
            busNumber?: string;
            routeId?: number;
            routeName?: string;
          }
        | undefined
      >
    ) => {
      state.modals.createTrip = true;
      if (action.payload?.busId && action.payload?.routeId) {
        state.creationFlow.trip.fromRouteCreation = true;
        state.creationFlow.trip.linkedBusId = action.payload.busId;
        state.creationFlow.trip.linkedBusNumber =
          action.payload.busNumber || null;
        state.creationFlow.trip.linkedRouteId = action.payload.routeId;
        state.creationFlow.trip.linkedRouteName =
          action.payload.routeName || null;
      }
    },
    closeCreateTripModal: (state) => {
      state.modals.createTrip = false;
      // Reset trip context
      state.creationFlow.trip.fromRouteCreation = false;
      state.creationFlow.trip.linkedBusId = null;
      state.creationFlow.trip.linkedBusNumber = null;
      state.creationFlow.trip.linkedRouteId = null;
      state.creationFlow.trip.linkedRouteName = null;
    },

    // Bus Details Modal
    openBusDetailsModal: (state, action: PayloadAction<number>) => {
      state.modals.busDetails = true;
      state.selectedBusId = action.payload;
    },
    closeBusDetailsModal: (state) => {
      state.modals.busDetails = false;
      state.selectedBusId = null;
    },

    // Trip details Modal
    openTripDetailsModal: (state, action: PayloadAction<BusDetailsTrip>) => {
      state.modals.tripDetails = true;
      state.selectedTripData = action.payload;
    },
    closeTripDetailsModal: (state) => {
      state.modals.tripDetails = false;
      state.selectedTripData = null;
    },

    // Edit Mode actions
    enableEditMode: (
      state,
      action: PayloadAction<'busDetails' | 'tripDetails'>
    ) => {
      state.editMode[action.payload] = true;
    },
    disableEditMode: (
      state,
      action: PayloadAction<'busDetails' | 'tripDetails'>
    ) => {
      state.editMode[action.payload] = false;
      state.unsavedChanges[action.payload] = false;
    },
    setUnsavedChanges: (
      state,
      action: PayloadAction<{
        modal: 'busDetails' | 'tripDetails';
        hasChanges: boolean;
      }>
    ) => {
      state.unsavedChanges[action.payload.modal] = action.payload.hasChanges;
    },
    setPendingNavigation: (
      state,
      action: PayloadAction<{
        from: 'busDetails' | 'tripDetails';
        to: 'busDetails' | 'tripDetails';
      }>
    ) => {
      state.pendingNavigation.from = action.payload.from;
      state.pendingNavigation.to = action.payload.to;
    },
    clearPendingNavigation: (state) => {
      state.pendingNavigation.from = null;
      state.pendingNavigation.to = null;
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
  openCreateTripModal,
  closeCreateTripModal,
  openBusDetailsModal,
  closeBusDetailsModal,
  openTripDetailsModal,
  closeTripDetailsModal,
  enableEditMode,
  disableEditMode,
  setUnsavedChanges,
  setPendingNavigation,
  clearPendingNavigation,
} = uiSlice.actions;

export default uiSlice.reducer;
