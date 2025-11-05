import { useCallback, useEffect, useState } from "react";
import { Dimensions } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { makeMutable } from "react-native-reanimated";
import { useAppContext } from "./AppContext";

type Side = "left" | "right";

export type DrawerState = {
    isOpen: boolean;
    progress: SharedValue<number>;
    drawerWidth: number;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

// Global state
const state = {
    left: { isOpen: false },
    right: { isOpen: false },
};

const progress = {
    left: makeMutable(0),
    right: makeMutable(0),
};

const listeners = new Set<() => void>();

const notify = () => listeners.forEach((fn) => fn());

const openDrawer = (side: Side) => {
    const other = side === "left" ? "right" : "left";
    if (state[other].isOpen) state[other].isOpen = false;
    state[side].isOpen = true;
    notify();
};

const closeDrawer = (side: Side) => {
    state[side].isOpen = false;
    notify();
};

const toggleDrawer = (side: Side) => {
    if (state[side].isOpen) {
        state[side].isOpen = false;
    } else {
        const other = side === "left" ? "right" : "left";
        if (state[other].isOpen) state[other].isOpen = false;
        state[side].isOpen = true;
    }
    notify();
};

export function useDrawer(side: Side): DrawerState {
    const { setDrawerOpen } = useAppContext();
    const [, forceUpdate] = useState({});

    // Subscribe to state changes
    useEffect(() => {
        const listener = () => forceUpdate({});
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    }, []);

    // Sync global drawer state with AppContext
    useEffect(() => {
        setDrawerOpen(state.left.isOpen || state.right.isOpen);
    }, [state.left.isOpen, state.right.isOpen, setDrawerOpen]);

    const open = useCallback(() => openDrawer(side), [side]);
    const close = useCallback(() => closeDrawer(side), [side]);
    const toggle = useCallback(() => toggleDrawer(side), [side]);

    const screenWidth = Dimensions.get("window").width;
    const drawerWidth = Math.min(360, Math.round(screenWidth * 0.8));

    return {
        isOpen: state[side].isOpen,
        progress: progress[side],
        drawerWidth,
        open,
        close,
        toggle,
    };
}

export const useLeftDrawer = () => useDrawer("left");
export const useRightDrawer = () => useDrawer("right");
