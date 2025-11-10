import React, { lazy, Suspense } from "react";
import Reanimated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
} from "react-native-reanimated";
import { useLeftDrawer, useRightDrawer } from "../hooks/useDrawer";
import Drawer from "../components/Drawer";
import AppHeader from "../components/AppHeader";
import { BottomNavigator } from "./BottomNavigator";
import MainMenu from "../components/MainMenu";
import OverlayPanel from "../components/primitives/OverlayPanel";
import LoadingScreen from "../components/primitives/LoadingScreen";
import { useAppActions, useCompareScreenState } from "../state/useAppStore";

// Lazy load heavy components for better initial load performance
const ScenarioManager = lazy(() => import("../screens/ScenarioManager"));
const Compare = lazy(() => import("../screens/Compare"));

export function RootNavigator() {
    const { progress: progressRight } = useRightDrawer();
    const { progress: progressLeft, drawerWidth: drawerWidthLeft } =
        useLeftDrawer();

    // Use specific selector - only re-renders when compare screen state changes
    const isCompareScreenActive = useCompareScreenState();

    // Get action without subscribing to state
    const { setCompareScreenActive } = useAppActions();

    // Use useDerivedValue for interpolations to avoid recalculating on every frame
    // This separates the interpolation logic from the style application
    const translateRight = useDerivedValue(() => {
        return interpolate(
            progressRight.value,
            [0, 1],
            [0, -drawerWidthLeft],
            Extrapolation.CLAMP,
        );
    }, [drawerWidthLeft]);

    const translateLeft = useDerivedValue(() => {
        return interpolate(
            progressLeft.value,
            [0, 1],
            [0, drawerWidthLeft],
            Extrapolation.CLAMP,
        );
    }, [drawerWidthLeft]);

    // Now just combine the derived values in the style
    const translate = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: translateLeft.value + translateRight.value },
            ],
        };
    });

    return (
        <>
            <Reanimated.View style={[{ flex: 1 }, translate]}>
                <AppHeader />
                {/* Suspense wrapper for lazy-loaded screens */}
                <Suspense fallback={<LoadingScreen />}>
                    <BottomNavigator />
                </Suspense>
            </Reanimated.View>

            <Drawer side="left">
                <MainMenu />
            </Drawer>

            <Drawer side="right">
                <Suspense fallback={<LoadingScreen />}>
                    <ScenarioManager />
                </Suspense>
            </Drawer>

            <OverlayPanel
                visible={isCompareScreenActive}
                onClose={() => setCompareScreenActive(false)}
            >
                <Suspense fallback={<LoadingScreen />}>
                    <Compare />
                </Suspense>
            </OverlayPanel>
        </>
    );
}
