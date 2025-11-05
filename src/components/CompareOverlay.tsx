import React, { useEffect } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useTheme } from "react-native-paper";
import { useAppContext } from "../state/AppContext";
import Compare from "../screens/Compare";

export default function CompareOverlay() {
  const { isCompareScreenActive, setCompareScreenActive } = useAppContext();
  const { width: windowWidth } = useWindowDimensions();
  const theme = useTheme();

  const progress = useSharedValue(isCompareScreenActive ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isCompareScreenActive ? 1 : 0, {
      damping: 18,
      stiffness: 240,
      overshootClamping: true,
    });
  }, [isCompareScreenActive, progress]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value * 0.5,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: (1 - progress.value) * windowWidth,
      },
    ],
  }));

  return (
    <>
      <Reanimated.View
        pointerEvents={isCompareScreenActive ? "auto" : "none"}
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: theme.colors.backdrop,
          },
          scrimStyle,
        ]}
      >
        <Pressable
          style={{ flex: 1 }}
          onPress={() => setCompareScreenActive(false)}
        />
      </Reanimated.View>

      <Reanimated.View
        pointerEvents={isCompareScreenActive ? "auto" : "none"}
        style={[
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1001,
            backgroundColor: "transparent",
          },
          panelStyle,
        ]}
      >
        <Compare />
      </Reanimated.View>
    </>
  );
}
