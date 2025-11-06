import React, { PropsWithChildren } from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { spacing } from "../../theme/spacing";

export type ScreenContainerProps = PropsWithChildren<{
    scroll?: boolean;
    scrollProps?: KeyboardAwareScrollViewProps;
    viewProps?: ViewProps;
}>;

export default function ScreenContainer({
    children,
    scroll = true,
    scrollProps,
    viewProps,
}: ScreenContainerProps) {
    if (scroll) {
        return (
            <KeyboardAwareScrollView
                style={styles.scroll}
                contentContainerStyle={styles.content}
                bottomOffset={40}
                showsVerticalScrollIndicator={false}
                disableScrollOnKeyboardHide={false}
                {...scrollProps}
            >
                {children}
            </KeyboardAwareScrollView>
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
