import { Platform } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import {
    cancelAnimation,
    makeMutable,
    withSpring,
} from "react-native-reanimated";

export type Side = "left" | "right";

export interface DrawerSnapshot {
    leftOpen: boolean;
    rightOpen: boolean;
}

export const SPRING_CONFIG = Platform.select({
    android: {
        damping: 30,
        mass: 1,
        stiffness: 350,
        overshootClamping: true, // Prevent bounce on Android
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    },
    default: {
        damping: 25,
        mass: 0.8,
        stiffness: 300,
        overshootClamping: true, // Prevent bounce on iOS
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
    },
});

// Shared animated progress values (0 closed, 1 open)
export const drawerProgress: Record<Side, SharedValue<number>> = {
    left: makeMutable(0),
    right: makeMutable(0),
};

let snapshot: DrawerSnapshot = { leftOpen: false, rightOpen: false };
const listeners = new Set<() => void>();

function emit() {
    listeners.forEach((l) => l());
}

function animateProgress(next: DrawerSnapshot) {
    const targetLeft = next.leftOpen ? 1 : 0;
    const targetRight = next.rightOpen ? 1 : 0;
    if (drawerProgress.left.value !== targetLeft) {
        cancelAnimation(drawerProgress.left);
        drawerProgress.left.value = withSpring(targetLeft, SPRING_CONFIG);
    }
    if (drawerProgress.right.value !== targetRight) {
        cancelAnimation(drawerProgress.right);
        drawerProgress.right.value = withSpring(targetRight, SPRING_CONFIG);
    }
}

export function getDrawerSnapshot(): DrawerSnapshot {
    return snapshot;
}

export function subscribeDrawer(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function openDrawer(side: Side) {
    const other: Side = side === "left" ? "right" : "left";
    snapshot = {
        leftOpen: side === "left",
        rightOpen: side === "right",
    };
    // ensure other closed explicitly (already handled by assignment above but kept for clarity)
    if (other === "left") snapshot.leftOpen = false;
    if (other === "right") snapshot.rightOpen = false;
    animateProgress(snapshot);
    emit();
}

export function closeDrawer(side: Side) {
    snapshot = {
        ...snapshot,
        leftOpen: side === "left" ? false : snapshot.leftOpen,
        rightOpen: side === "right" ? false : snapshot.rightOpen,
    };
    animateProgress(snapshot);
    emit();
}

export function toggleDrawer(side: Side) {
    const willOpen = side === "left" ? !snapshot.leftOpen : !snapshot.rightOpen;
    if (willOpen) {
        openDrawer(side);
    } else {
        closeDrawer(side);
    }
}
