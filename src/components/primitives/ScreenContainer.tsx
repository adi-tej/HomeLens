import React, { PropsWithChildren } from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { spacing } from "@theme/spacing";

export type ScreenContainerProps = PropsWithChildren<{
    scroll?: boolean;
    scrollProps?: Omit<KeyboardAwareScrollViewProps, "ref">;
    scrollRef?: React.RefObject<any>;
    viewProps?: ViewProps;
}>;

export default function ScreenContainer({
    children,
    scroll = true,
    scrollProps,
    scrollRef,
    viewProps,
}: ScreenContainerProps) {
    if (scroll) {
        return (
            <KeyboardAwareScrollView
                ref={scrollRef}
                style={styles.scroll}
                contentContainerStyle={styles.content}
                bottomOffset={40}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
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
    },
});
