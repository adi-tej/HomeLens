import React, { useEffect, useMemo } from "react";
import { Platform, Pressable, StyleSheet } from "react-native";
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
import { useDrawer } from "../state/useDrawer";
import { useAppContext } from "../state/AppContext";
import { useScenarios } from "../state/ScenarioContext";

type Side = "left" | "right";

type Props = {
  side: Side;
  children?: React.ReactNode;
};

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 280,
  overshootClamping: true,
};

export default function Drawer({ side, children }: Props) {
  const { progress, drawerWidth, isOpen, open, close } = useDrawer(side);
  const { isDrawerOpen, isCompareScreenActive, setCompareScreenActive } =
    useAppContext();
  const { comparisonMode, setComparisonMode, clearSelectedScenarios } =
    useScenarios();
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

  // Sync progress with isOpen state
  useEffect(() => {
    const targetValue = isOpen ? 1 : 0;
    cancelAnimation(progress);
    progress.value = withSpring(targetValue, {
      damping: 15,
      stiffness: 250,
      overshootClamping: true,
    });
  }, [isOpen, progress]);

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
            const delta = isLeft ? event.translationX : -event.translationX;
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
            progress.value = withSpring(shouldTarget1 ? 1 : 0, SPRING_CONFIG);
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
  const scrimGesture = createGesture(
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
      <GestureDetector gesture={scrimGesture}>
        <Reanimated.View
          pointerEvents={isOpen && allowScrimClose ? "auto" : "none"}
          style={[
            styles.scrim,
            { backgroundColor: theme.colors.backdrop },
            scrimStyle,
          ]}
        >
          <Pressable
            style={styles.scrimPressable}
            onPress={allowScrimClose ? close : undefined}
          />
        </Reanimated.View>
      </GestureDetector>

      {/* Drawer */}
      <GestureDetector gesture={drawerGesture}>
        <Reanimated.View
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
  scrimPressable: {
    flex: 1,
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
