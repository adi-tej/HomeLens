import React, { useEffect, useMemo } from "react";
import { Platform, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
    cancelAnimation,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "react-native-paper";
import { SPRING_CONFIG, useDrawer } from "../hooks/useDrawer";
import { useAppContext } from "../state/AppContext";
import { useComparisonState } from "../state/useScenarioStore";

type Side = "left" | "right";

type Props = {
    side: Side;
    children?: React.ReactNode;
};

export default function Drawer({ side, children }: Props) {
    const { progress, drawerWidth, isOpen, open, close } = useDrawer(side);
    const { isDrawerOpen, isCompareScreenActive, setCompareScreenActive } =
        useAppContext();
    const { comparisonMode, setComparisonMode, clearSelectedScenarios } =
        useComparisonState();
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const isGestureActive = useSharedValue(false);
    const isLeft = side === "left";
    const HEADER_BLOCK = insets.top + (Platform.OS === "ios" ? 64 : 56);

    // Disable right drawer gestures when Compare screen is active
    const isGestureEnabled = isLeft || !isCompareScreenActive;

    // Disable scrim press to close when right drawer is in compare mode
    const allowScrimClose = !(side === "right" && isCompareScreenActive);

    // Exit compare mode when right drawer closes
    useEffect(() => {
        if (side === "right" && !isOpen && comparisonMode) {
            setComparisonMode(false);
            clearSelectedScenarios();
            setCompareScreenActive(false);
        }
    }, [
        side,
        isOpen,
        comparisonMode,
        setComparisonMode,
        clearSelectedScenarios,
        setCompareScreenActive,
    ]);

    // Gesture factory
    const createGesture = useMemo(
        () =>
            (
                offsetX: number | [number, number],
                enabled: boolean,
                fromOpen: boolean,
            ) =>
                Gesture.Pan()
                    .activeOffsetX(offsetX as any)
                    .failOffsetY([-15, 15])
                    .enabled(enabled)
                    .onBegin(() => {
                        "worklet";
                        cancelAnimation(progress);
                        isGestureActive.value = true;
                    })
                    .onUpdate((event) => {
                        "worklet";
                        const delta = isLeft
                            ? event.translationX
                            : -event.translationX;
                        const base = fromOpen ? 1 : 0;
                        progress.value = Math.max(
                            0,
                            Math.min(1, base + delta / drawerWidth),
                        );
                    })
                    .onEnd((event) => {
                        "worklet";
                        const threshold = fromOpen ? 0.5 : 0.3;
                        const velocityThreshold = 500;
                        const shouldTarget1 = fromOpen
                            ? progress.value >= threshold &&
                              (isLeft
                                  ? event.velocityX >= -velocityThreshold
                                  : event.velocityX <= velocityThreshold)
                            : progress.value > threshold ||
                              (isLeft
                                  ? event.velocityX > velocityThreshold
                                  : event.velocityX < -velocityThreshold);

                        isGestureActive.value = false;
                        progress.value = withSpring(
                            shouldTarget1 ? 1 : 0,
                            SPRING_CONFIG,
                        );
                        runOnJS(shouldTarget1 ? open : close)();
                    }),
        [isLeft, progress, drawerWidth, isGestureActive, open, close],
    );

    const edgeGesture = createGesture(
        isLeft ? 5 : -5,
        !isDrawerOpen && isGestureEnabled,
        false,
    );
    const drawerGesture = createGesture(
        [-10, 10],
        isOpen && isGestureEnabled,
        true,
    );

    // Use Tap gesture for scrim instead of Pan for better Android compatibility
    const scrimTapGesture = useMemo(
        () =>
            Gesture.Tap()
                .enabled(isOpen && isGestureEnabled && allowScrimClose)
                .onEnd(() => {
                    "worklet";
                    runOnJS(close)();
                }),
        [isOpen, isGestureEnabled, allowScrimClose, close],
    );

    const scrimPanGesture = createGesture(
        isLeft ? [-10, -Infinity] : [10, Infinity],
        isOpen && isGestureEnabled,
        true,
    );

    // Animated styles
    const drawerStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: isLeft
                    ? (progress.value - 1) * drawerWidth
                    : (1 - progress.value) * drawerWidth,
            },
        ],
    }));

    const scrimStyle = useAnimatedStyle(() => ({
        opacity: progress.value * 0.5,
    }));

    return (
        <>
            {/* Edge swipe area */}
            {!isDrawerOpen && isGestureEnabled && (
                <GestureDetector gesture={edgeGesture}>
                    <Reanimated.View
                        style={[
                            styles.edgeArea,
                            { top: HEADER_BLOCK, [side]: 0, width: 20 },
                        ]}
                    />
                </GestureDetector>
            )}

            {/* Scrim overlay */}
            <GestureDetector
                gesture={Gesture.Exclusive(scrimTapGesture, scrimPanGesture)}
            >
                <Reanimated.View
                    renderToHardwareTextureAndroid
                    pointerEvents={isOpen ? "auto" : "none"}
                    style={[
                        styles.scrim,
                        { backgroundColor: theme.colors.backdrop },
                        scrimStyle,
                    ]}
                />
            </GestureDetector>

            {/* Drawer */}
            <GestureDetector gesture={drawerGesture}>
                <Reanimated.View
                    renderToHardwareTextureAndroid
                    style={[
                        styles.drawer,
                        {
                            width: drawerWidth,
                            [side]: 0,
                            backgroundColor: theme.colors.surface,
                        },
                        drawerStyle,
                    ]}
                >
                    {children}
                </Reanimated.View>
            </GestureDetector>
        </>
    );
}

const styles = StyleSheet.create({
    edgeArea: {
        position: "absolute",
        bottom: 0,
        zIndex: 999,
        backgroundColor: "transparent",
    },
    scrim: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 998,
    },
    drawer: {
        position: "absolute",
        top: 0,
        bottom: 0,
        zIndex: 1000,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
