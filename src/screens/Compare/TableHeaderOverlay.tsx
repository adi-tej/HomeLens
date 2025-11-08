import React from "react";
import { Animated, Image, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { HeaderCell, TABLE_CONFIG } from "../../components/table";
import type { Scenario } from "../../state/useScenarioStore";

interface TableHeaderOverlayProps {
    scenarios: Scenario[];
    scrollX: Animated.Value;
    contentWidth: number;
}

export default function TableHeaderOverlay({
    scenarios,
    scrollX,
    contentWidth,
}: TableHeaderOverlayProps) {
    const theme = useTheme();

    return (
        <View
            style={[
                styles.headerOverlay,
                {
                    backgroundColor: theme.colors.surface,
                    borderBottomColor: theme.colors.outline,
                },
            ]}
            pointerEvents="none"
        >
            {/* Fixed corner cell with app icon */}
            <View
                style={[
                    styles.cornerCellAbsolute,
                    {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.outline,
                        shadowColor: "#000",
                        shadowOffset: { width: 2, height: 2 },
                        shadowOpacity: 0.12,
                        shadowRadius: 4,
                        elevation: 5,
                        justifyContent: "center",
                        alignItems: "center",
                    },
                ]}
            >
                <Image
                    source={require("../../../assets/icon.png")}
                    style={styles.cornerIcon}
                    accessibilityLabel="App icon"
                />
            </View>

            {/* Scrollable header cells */}
            <View style={styles.headerScrollableMask}>
                <Animated.View
                    style={[
                        styles.headerRow,
                        {
                            width: contentWidth,
                            transform: [
                                {
                                    translateX: Animated.multiply(scrollX, -1),
                                },
                            ],
                        },
                    ]}
                >
                    {scenarios.map((scenario) => (
                        <HeaderCell
                            key={scenario.id}
                            name={scenario.name}
                            theme={theme}
                        />
                    ))}
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: TABLE_CONFIG.headerHeight,
        zIndex: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 4,
    },
    cornerCellAbsolute: {
        position: "absolute",
        left: 0,
        top: 0,
        width: TABLE_CONFIG.labelWidth,
        height: TABLE_CONFIG.headerHeight,
        zIndex: 2,
    },
    headerScrollableMask: {
        position: "absolute",
        left: TABLE_CONFIG.labelWidth,
        right: 0,
        top: 0,
        height: TABLE_CONFIG.headerHeight,
        overflow: "hidden",
    },
    headerRow: {
        flexDirection: "row",
        height: TABLE_CONFIG.headerHeight,
    },
    cornerIcon: {
        width: 28,
        height: 28,
        resizeMode: "contain",
        opacity: 0.9,
    },
});
