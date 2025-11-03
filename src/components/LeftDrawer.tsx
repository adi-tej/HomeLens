import React from "react";
import { Animated, StyleSheet, TouchableWithoutFeedback, View } from "react-native";
import { useTheme } from "react-native-paper";
import { useLeftDrawer } from "../state/LeftDrawerContext";

export default function LeftDrawer({ children }: { children?: React.ReactNode }) {
  const theme = useTheme();
  const { progress, drawerWidth, isOpen, close } = useLeftDrawer();

  const translateX = progress.interpolate({ inputRange: [0, 1], outputRange: [-drawerWidth, 0] });
  const overlayOpacity = progress.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] });

  const scrimColor = theme.colors.onSurface;
  const shadowColor = theme.colors.onSurface;

  return (
    <>
      {/* Scrim */}
      <Animated.View
        pointerEvents={"none"}
        style={[styles.scrimContainer, { opacity: overlayOpacity, backgroundColor: scrimColor }]}
      />

      {/* Touchable scrim to close - only active when open */}
      <Animated.View
        pointerEvents={isOpen ? "auto" : "none"}
        style={[styles.scrimTouchable, { opacity: overlayOpacity }]}
      >
        <TouchableWithoutFeedback onPress={close} accessibilityLabel="Close drawer">
          <View style={styles.touchArea} />
        </TouchableWithoutFeedback>
      </Animated.View>

      {/* Drawer panel */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            backgroundColor: theme.colors.surface,
            transform: [{ translateX }],
            shadowColor,
          },
        ]}
        accessibilityViewIsModal={true}
      >
        {children}
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  scrimContainer: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "black",
  },
  scrimTouchable: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
  },
  touchArea: {
    flex: 1,
  },
  drawer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 16,
  },
});
