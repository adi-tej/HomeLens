import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import { LabelCell, TABLE_CONFIG } from "../../components/table";
import type { ComparisonRow } from "../../hooks/useComparisonData";

interface TableLabelOverlayProps {
    comparisonRows: ComparisonRow[];
    scrollY: Animated.Value;
}

export default function TableLabelOverlay({
    comparisonRows,
    scrollY,
}: TableLabelOverlayProps) {
    const theme = useTheme();

    return (
        <View
            style={[
                styles.labelColumnOverlay,
                {
                    backgroundColor: theme.colors.surface,
                    top: TABLE_CONFIG.headerHeight,
                },
            ]}
            pointerEvents="none"
        >
            <Animated.View
                style={{
                    transform: [
                        {
                            translateY: Animated.multiply(scrollY, -1),
                        },
                    ],
                }}
            >
                {comparisonRows.map((item, index) => (
                    <View
                        key={item.key}
                        style={{
                            height:
                                item.section === "header"
                                    ? TABLE_CONFIG.headerHeight
                                    : TABLE_CONFIG.rowHeight,
                        }}
                    >
                        <LabelCell
                            label={item.label}
                            highlight={item.highlight}
                            isLast={index === comparisonRows.length - 1}
                            theme={theme}
                            isSection={item.section === "header"}
                        />
                    </View>
                ))}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    labelColumnOverlay: {
        position: "absolute",
        left: 0,
        bottom: 0,
        width: TABLE_CONFIG.labelWidth,
        zIndex: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 0 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
});
