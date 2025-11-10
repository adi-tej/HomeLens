import { useCallback, useEffect, useSyncExternalStore } from "react";
import { Dimensions } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import { useAppContext } from "../state/AppContext";
import {
    closeDrawer,
    drawerProgress,
    getDrawerSnapshot,
    openDrawer,
    type Side,
    SPRING_CONFIG,
    subscribeDrawer,
    toggleDrawer,
} from "../state/useDrawerStore";

export type DrawerState = {
    isOpen: boolean;
    progress: SharedValue<number>;
    drawerWidth: number;
    open: () => void;
    close: () => void;
    toggle: () => void;
};

export { SPRING_CONFIG };

export function useDrawer(side: Side): DrawerState {
    const { setDrawerOpen } = useAppContext();

    const { leftOpen, rightOpen } = useSyncExternalStore(
        subscribeDrawer,
        getDrawerSnapshot,
        getDrawerSnapshot,
    );

    useEffect(() => {
        setDrawerOpen(leftOpen || rightOpen);
    }, [leftOpen, rightOpen, setDrawerOpen]);

    const screenWidth = Dimensions.get("window").width;
    const drawerWidth = Math.min(360, Math.round(screenWidth * 0.8));

    const open = useCallback(() => openDrawer(side), [side]);
    const close = useCallback(() => closeDrawer(side), [side]);
    const toggle = useCallback(() => toggleDrawer(side), [side]);

    const isOpen = side === "left" ? leftOpen : rightOpen;

    return {
        isOpen,
        progress: drawerProgress[side],
        drawerWidth,
        open,
        close,
        toggle,
    };
}

export const useLeftDrawer = () => useDrawer("left");
export const useRightDrawer = () => useDrawer("right");
