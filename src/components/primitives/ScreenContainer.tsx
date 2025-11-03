import React, { PropsWithChildren } from "react";
import {
  ScrollView,
  View,
  StyleSheet,
  ScrollViewProps,
  ViewProps,
} from "react-native";
import { spacing } from "../../theme/spacing";

export type ScreenContainerProps = PropsWithChildren<{
  scroll?: boolean;
  contentInsetBottom?: number;
  scrollProps?: ScrollViewProps;
  viewProps?: ViewProps;
}>;

export default function ScreenContainer({
  children,
  scroll = true,
  contentInsetBottom = spacing.xl,
  scrollProps,
  viewProps,
}: ScreenContainerProps) {
  if (scroll) {
    return (
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        contentInset={{ bottom: contentInsetBottom }}
        scrollIndicatorInsets={{ bottom: contentInsetBottom }}
        {...scrollProps}
      >
        {children}
      </ScrollView>
    );
  }
  return (
    <View style={styles.content} {...viewProps}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
    flexGrow: 1,
  },
});
