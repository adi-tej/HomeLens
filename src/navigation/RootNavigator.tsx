import React from "react";
import { Animated, View } from "react-native";
import { useRightDrawer } from "../state/RightDrawerContext";
import { useLeftDrawer } from "../state/LeftDrawerContext";
import RightDrawer from "../components/RightDrawer";
import AppHeader from "../components/AppHeader";
import { BottomNavigator } from "./BottomNavigator";
import ScenarioHandler from "../components/ScenarioHandler";
import LeftDrawer from "../components/LeftDrawer";
import MainMenu from "../components/MainMenu";

export function RootNavigator() {
  const { progress: progressRight, drawerWidth: drawerWidthRight } = useRightDrawer();
  const { progress: progressLeft, drawerWidth: drawerWidthLeft } = useLeftDrawer();

  const translateRight = progressRight.interpolate({ inputRange: [0, 1], outputRange: [0, -drawerWidthRight] });
  const translateLeft = progressLeft.interpolate({ inputRange: [0, 1], outputRange: [0, drawerWidthLeft] });
  const translateX = Animated.add(translateLeft, translateRight);
  return (
    <>
      <Animated.View style={{ flex: 1, transform: [{ translateX }] }}>
        <AppHeader />
        <BottomNavigator />
      </Animated.View>
      <RightDrawer>
        <View style={{ flex: 1 }}>
          <ScenarioHandler />
        </View>
      </RightDrawer>
      <LeftDrawer>
        <MainMenu />
      </LeftDrawer>
    </>
  );
}
