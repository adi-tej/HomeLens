import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { spacing } from '../theme/spacing';
import ScreenContainer from '../components/primitives/ScreenContainer';

export default function ScenariosScreen() {
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
