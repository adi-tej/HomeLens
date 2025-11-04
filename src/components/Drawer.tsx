import React, { useEffect } from "react";
import { StyleSheet, Pressable, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  cancelAnimation,
  runOnJS,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useDrawer } from "../state/useDrawer";
import { useAppContext } from "../state/AppContext";

type Side = "left" | "right";

type Props = {
  side: Side;
  children?: React.ReactNode;
};

export default function Drawer({ side, children }: Props) {
  const { progress, drawerWidth, isOpen, open, close } = useDrawer(side);
  const { isDrawerOpen } = useAppContext();
  const insets = useSafeAreaInsets();
  const isGestureActive = useSharedValue(false);
  const EDGE_WIDTH = 20;
  const HEADER_HEIGHT = Platform.OS === "ios" ? 64 : 56;
  const HEADER_BLOCK = insets.top + HEADER_HEIGHT;

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

  // Constants
  const isLeft = side === "left";
  const SPRING_CONFIG = {
    damping: 20,
    stiffness: 280,
    overshootClamping: true,
  };

  // Helper to calculate progress from translation
  const calcProgress = (translation: number, fromOpen = false) => {
    "worklet";
    const base = fromOpen ? 1 : 0;
    const delta = isLeft ? translation : -translation;
    return Math.max(0, Math.min(1, base + delta / drawerWidth));
  };

  // Helper to animate to target
  const animateToTarget = (target: 0 | 1) => {
    "worklet";
    progress.value = withSpring(target, SPRING_CONFIG);
    runOnJS(target === 1 ? open : close)();
  };

  // Edge swipe gesture to open drawer
  const edgeGesture = Gesture.Pan()
    .activeOffsetX(isLeft ? 5 : -5)
    .failOffsetY([-20, 20])
    .enabled(!isDrawerOpen)
    .onBegin(() => {
      "worklet";
      cancelAnimation(progress);
      isGestureActive.value = true;
    })
    .onUpdate((event) => {
      "worklet";
      progress.value = calcProgress(event.translationX);
    })
    .onEnd((event) => {
      "worklet";
      const velocity = event.velocityX;
      const currentProgress = Math.max(0, Math.min(1, progress.value));
      const shouldOpen =
        currentProgress > 0.3 || (isLeft ? velocity > 500 : velocity < -500);

      isGestureActive.value = false;
      animateToTarget(shouldOpen ? 1 : 0);
    });

  // Drawer & Scrim swipe gestures (shared logic for closing)
  const createCloseGesture = (offsetX: number | [number, number]) =>
    Gesture.Pan()
      .activeOffsetX(offsetX as any)
      .failOffsetY([-15, 15])
      .enabled(isOpen)
      .onStart(() => {
        "worklet";
        isGestureActive.value = true;
        cancelAnimation(progress);
      })
      .onUpdate((event) => {
        "worklet";
        progress.value = calcProgress(event.translationX, true);
      })
      .onEnd((event) => {
        "worklet";
        const velocity = event.velocityX;
        const currentProgress = Math.max(0, Math.min(1, progress.value));
        const shouldClose =
          currentProgress < 0.5 || (isLeft ? velocity < -500 : velocity > 500);

        isGestureActive.value = false;
        animateToTarget(shouldClose ? 0 : 1);
      });

  const drawerGesture = createCloseGesture([-10, 10]);
  const scrimGesture = createCloseGesture(
    isLeft ? [-10, -Infinity] : [10, Infinity],
  );

  // Animated styles
  const drawerStyle = useAnimatedStyle(() => {
    const translateX =
      side === "left"
        ? (progress.value - 1) * drawerWidth
        : (1 - progress.value) * drawerWidth;

    return {
      transform: [{ translateX }],
    };
  });

  const scrimStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value * 0.5,
    };
  });

  const handleScrimPress = () => {
    close();
  };

  return (
    <>
      {/* Edge swipe area - only active when NO drawer is open */}
      {!isDrawerOpen && (
        <GestureDetector gesture={edgeGesture}>
          <Reanimated.View
            style={[
              styles.edgeArea,
              { top: HEADER_BLOCK },
              side === "left"
                ? { left: 0, width: EDGE_WIDTH }
                : { right: 0, width: EDGE_WIDTH },
            ]}
          />
        </GestureDetector>
      )}

      {/* Scrim overlay */}
      <GestureDetector gesture={scrimGesture}>
        <Reanimated.View
          pointerEvents={isOpen ? "auto" : "none"}
          style={[styles.scrim, scrimStyle]}
        >
          <Pressable style={styles.scrimPressable} onPress={handleScrimPress} />
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
    backgroundColor: "black",
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
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
