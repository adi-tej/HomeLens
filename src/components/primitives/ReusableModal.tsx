import React from "react";
import { StyleSheet, ViewStyle } from "react-native";
import { IconButton, Modal, Portal, Text, useTheme } from "react-native-paper";
import type { KeyboardAwareScrollViewProps } from "react-native-keyboard-controller";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { spacing } from "../../theme/spacing";

type Props = {
    visible: boolean;
    onDismiss: () => void;
    title?: string;
    children?: React.ReactNode;
    contentStyle?: ViewStyle;
    // Allow callers to control the inner scroll view (matching ScreenContainer usage)
    scrollProps?: Omit<KeyboardAwareScrollViewProps, "ref">;
    // Optionally hide the close icon when the inner content already renders one
    hideClose?: boolean;
};

export default function ReusableModal({
    visible,
    onDismiss,
    title,
    children,
    contentStyle,
    scrollProps,
    hideClose = false,
}: Props) {
    const theme = useTheme();
    return (
        <Portal>
            <Modal
                visible={visible}
                onDismiss={onDismiss}
                contentContainerStyle={[
                    styles.container,
                    { backgroundColor: theme.colors.surface },
                    contentStyle,
                ]}
                dismissable={true}
            >
                <KeyboardAwareScrollView
                    contentContainerStyle={[
                        styles.content,
                        (scrollProps &&
                            (scrollProps as any).contentContainerStyle) ||
                            {},
                    ]}
                    bottomOffset={scrollProps?.bottomOffset ?? 40}
                    showsVerticalScrollIndicator={
                        scrollProps?.showsVerticalScrollIndicator ?? true
                    }
                    keyboardShouldPersistTaps={
                        scrollProps?.keyboardShouldPersistTaps ?? "handled"
                    }
                    disableScrollOnKeyboardHide={
                        scrollProps?.disableScrollOnKeyboardHide ?? false
                    }
                    {...scrollProps}
                >
                    {title ? (
                        <Text variant="titleLarge" style={{ marginBottom: 8 }}>
                            {title}
                        </Text>
                    ) : null}
                    {children}
                </KeyboardAwareScrollView>

                {/* Close icon overlapping the top-right of the card - rendered after scroll so it sits above */}
                {!hideClose && (
                    <IconButton
                        icon="close"
                        size={24}
                        onPress={onDismiss}
                        style={styles.closeIcon}
                        accessibilityLabel="Close"
                    />
                )}
            </Modal>
        </Portal>
    );
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: spacing.lg,
        marginVertical: spacing.lg,
        padding: spacing.lg,
        borderRadius: 20,
        // Elevation / shadow to give depth similar to Expenses modal
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
        overflow: "visible",
    },
    content: {
        paddingBottom: spacing.xl,
    },
    closeIcon: {
        position: "absolute",
        right: 0,
        top: 0,
        zIndex: 9999,
        elevation: 12,
        backgroundColor: "transparent",
    },
});
