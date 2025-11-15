import React from "react";
import { StyleSheet, View } from "react-native";
import { Appbar, Text, useTheme } from "react-native-paper";
import { spacing } from "@theme/spacing";
import { useLeftDrawer, useRightDrawer } from "@hooks/useDrawer";
import Logo from "./Logo";

export default function AppHeader() {
    const theme = useTheme();
    const {
        open: openRight,
        close: closeRight,
        isOpen: rightIsOpen,
    } = useRightDrawer();
    const {
        open: openLeft,
        close: closeLeft,
        isOpen: leftIsOpen,
    } = useLeftDrawer();

    const onPressLeft = () => {
        if (rightIsOpen) closeRight();
        if (!leftIsOpen) openLeft();
    };
    const onPressRight = () => {
        if (leftIsOpen) closeLeft();
        if (!rightIsOpen) openRight();
    };

    return (
        <Appbar.Header style={styles.header}>
            <View style={styles.row}>
                <Appbar.Action
                    icon="reorder-horizontal"
                    onPress={onPressLeft}
                    size={28}
                    color={theme.colors.onSurfaceVariant}
                    accessibilityLabel="Open left menu"
                    style={styles.leftMenuButton}
                />
                <View style={styles.centerContainer}>
                    <View style={styles.logoContainer}>
                        <Logo width={28} height={28} />
                    </View>
                    <Text
                        variant={"headlineSmall"}
                        style={[
                            styles.brandText,
                            { color: theme.colors.primary },
                        ]}
                    >
                        Home Lens
                    </Text>
                </View>
                <Appbar.Action
                    icon="apps"
                    onPress={onPressRight}
                    size={28}
                    color={theme.colors.onSurfaceVariant}
                    accessibilityLabel="Open menu"
                    style={styles.menuButton}
                />
            </View>
        </Appbar.Header>
    );
}

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        flex: 1,
    },
    leftMenuButton: {
        margin: 0,
        marginLeft: -spacing.sm,
    },
    centerContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: spacing.sm,
        pointerEvents: "none",
    },
    logoContainer: {
        height: 28,
    },
    brandText: {
        fontWeight: "400",
        letterSpacing: -0.5,
        marginBottom: -spacing.sm,
    },
    menuButton: {
        margin: 0,
    },
});
