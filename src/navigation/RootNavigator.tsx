import React, { lazy, Suspense } from "react";
import Reanimated, {
    Extrapolation,
    interpolate,
    useAnimatedStyle,
} from "react-native-reanimated";
import { useLeftDrawer, useRightDrawer } from "../hooks/useDrawer";
import Drawer from "../components/Drawer";
import AppHeader from "../components/AppHeader";
import { BottomNavigator } from "./BottomNavigator";
import MainMenu from "../components/MainMenu";
import OverlayPanel from "../components/primitives/OverlayPanel";
import LoadingScreen from "../components/primitives/LoadingScreen";
import { useAppContext } from "../state/AppContext";

// Lazy load heavy components for better initial load performance
const ScenarioManager = lazy(() => import("../screens/ScenarioManager"));
const Compare = lazy(() => import("../screens/Compare"));

export function RootNavigator() {
    const { progress: progressRight } = useRightDrawer();
    const { progress: progressLeft, drawerWidth: drawerWidthLeft } =
        useLeftDrawer();
    const { isCompareScreenActive, setCompareScreenActive } = useAppContext();

    const translate = useAnimatedStyle(() => {
        const translateRight = interpolate(
            progressRight.value,
            [0, 1],
            [0, -drawerWidthLeft],
            Extrapolation.CLAMP,
        );
        const translateLeft = interpolate(
            progressLeft.value,
            [0, 1],
            [0, drawerWidthLeft],
            Extrapolation.CLAMP,
        );
        return { transform: [{ translateX: translateLeft + translateRight }] };
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
