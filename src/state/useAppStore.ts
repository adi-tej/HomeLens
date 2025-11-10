import { create } from "zustand";

/**
 * App-wide UI state store using Zustand for better performance
 * Replaces AppContext to prevent unnecessary re-renders
 * Each state slice can be subscribed to independently
 */

interface AppStore {
    // State
    isDrawerOpen: boolean;
    isCompareScreenActive: boolean;
    activeRouteName: string | undefined;

    // Actions
    setDrawerOpen: (isOpen: boolean) => void;
    setCompareScreenActive: (isActive: boolean) => void;
    setActiveRouteName: (name: string | undefined) => void;
}

export const useAppStore = create<AppStore>((set) => ({
    // Initial state
    isDrawerOpen: false,
    isCompareScreenActive: false,
    activeRouteName: undefined,

    // Actions
    setDrawerOpen: (isOpen: boolean) => {
        set({ isDrawerOpen: isOpen });
    },

    setCompareScreenActive: (isActive: boolean) => {
        set({ isCompareScreenActive: isActive });
    },

    setActiveRouteName: (name: string | undefined) => {
        set({ activeRouteName: name });
    },
}));

/**
 * Selector hooks for specific state slices
 * These prevent components from re-rendering when unrelated state changes
 */

// Only re-renders when drawer state changes
export function useDrawerState() {
    return useAppStore((state) => state.isDrawerOpen);
}

// Only re-renders when compare screen state changes
export function useCompareScreenState() {
    return useAppStore((state) => state.isCompareScreenActive);
}

// Only re-renders when active route changes
export function useActiveRoute() {
    return useAppStore((state) => state.activeRouteName);
}

// Get actions without subscribing to state (never re-renders)
export function useAppActions() {
    return {
        setDrawerOpen: useAppStore((state) => state.setDrawerOpen),
        setCompareScreenActive: useAppStore(
            (state) => state.setCompareScreenActive,
        ),
        setActiveRouteName: useAppStore((state) => state.setActiveRouteName),
    };
}
