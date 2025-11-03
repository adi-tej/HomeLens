import React, { PropsWithChildren } from 'react';
import { Text } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { spacing } from '../../theme/spacing';

export default function SectionTitle({ children }: PropsWithChildren<{}>) {
  return (
    <Text variant="titleMedium" accessibilityRole="header" style={styles.title}>{children}</Text>
  );
}

const styles = StyleSheet.create({
  title: { marginTop: spacing.md },
});
