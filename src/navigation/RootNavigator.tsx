import React from "react";
import { View } from "react-native";
import Reanimated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useLeftDrawer, useRightDrawer } from "../state/useDrawer";
import Drawer from "../components/Drawer";
import AppHeader from "../components/AppHeader";
import { BottomNavigator } from "./BottomNavigator";
import ScenarioManager from "../screens/ScenarioManager";
import MainMenu from "../components/MainMenu";

export function RootNavigator() {
  const { progress: progressRight, drawerWidth: drawerWidthRight } =
    useRightDrawer();
  const { progress: progressLeft, drawerWidth: drawerWidthLeft } =
    useLeftDrawer();

  const animatedStyle = useAnimatedStyle(() => {
    const translateRight = interpolate(
      progressRight.value,
      [0, 1],
      [0, -drawerWidthRight],
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
      <Reanimated.View style={[{ flex: 1 }, animatedStyle]}>
        <AppHeader />
        <BottomNavigator />
      </Reanimated.View>
      <Drawer side="left">
        <MainMenu />
      </Drawer>
      <Drawer side="right">
        <View style={{ flex: 1 }}>
          <ScenarioManager />
        </View>
      </Drawer>
    </>
  );
}
