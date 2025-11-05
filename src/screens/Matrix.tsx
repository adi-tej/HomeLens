import React from "react";
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";
import ScreenContainer from "../components/primitives/ScreenContainer";

export default function Matrix() {
  return (
    <View style={styles.container}>
      <ScreenContainer>
        <Text>Define and compare what-if scenarios here.</Text>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
