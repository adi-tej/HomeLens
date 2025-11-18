import React, { useEffect } from "react";
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";

export type Option = { label?: string | number; value: string | number };

export type NativeSelectModalProps = {
    visible: boolean;
    options: Option[];
    onSelect: (o: Option) => void;
    onCancel: () => void;
    renderLabel?: (o: Option) => string;
};

export default function SelectModal({
    visible,
    options,
    onSelect,
    onCancel,
    renderLabel,
}: NativeSelectModalProps) {
    const theme = useTheme();
    const isDark = theme.dark as unknown as boolean | undefined;
    const backdropColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)";
    const { height: screenHeight } = useWindowDimensions();
    const translateY = useSharedValue(screenHeight);

    useEffect(() => {
        if (visible) {
            translateY.value = withTiming(0, { duration: 250 });
        } else {
            translateY.value = screenHeight;
        }
    }, [visible, screenHeight]);

    const handleClose = () => {
        translateY.value = withTiming(screenHeight, { duration: 200 }, () => {
            runOnJS(onCancel)();
        });
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            translateY.value = Math.max(0, event.translationY);
        })
        .onEnd((event) => {
            if (translateY.value > 100 || event.velocityY > 500) {
                const target = Math.max(translateY.value, screenHeight);
                translateY.value = withTiming(target, { duration: 200 }, () => {
                    runOnJS(onCancel)();
                });
            } else {
                translateY.value = withTiming(0, { duration: 200 });
            }
        });

    // Animated style for the sheet
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            animationType="none"
            transparent
            onRequestClose={handleClose}
        >
            <Pressable
                style={[styles.backdrop, { backgroundColor: backdropColor }]}
                onPress={handleClose}
            >
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        style={[
                            styles.container,
                            animatedStyle,
                            { backgroundColor: theme.colors.surfaceVariant },
                        ]}
                    >
                        <View
                            style={[
                                styles.handle,
                                { backgroundColor: theme.colors.outline },
                            ]}
                        />
                        <ScrollView contentContainerStyle={styles.list}>
                            {options.map((o) => (
                                <TouchableOpacity
                                    key={String(o.value)}
                                    style={[
                                        styles.option,
                                        {
                                            borderBottomColor:
                                                theme.colors.outline,
                                        },
                                    ]}
                                    onPress={() => onSelect(o)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            { color: theme.colors.onSurface },
                                        ]}
                                    >
                                        {renderLabel
                                            ? renderLabel(o)
                                            : String(o.label ?? o.value)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={handleClose}
                        >
                            <Text
                                style={[
                                    styles.cancelText,
                                    { color: theme.colors.primary },
                                ]}
                            >
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>
                </GestureDetector>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "flex-end",
    },
    container: {
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        maxHeight: "70%",
        paddingBottom: 8,
    },
    handle: {
        alignSelf: "center",
        width: 40,
        height: 4,
        borderRadius: 2,
        marginVertical: 8,
    },
    list: { paddingTop: 8 },
    option: {
        padding: 16,
        borderBottomWidth: StyleSheet.hairlineWidth,
        alignItems: "center",
    },
    optionText: { fontSize: 16, textAlign: "center" },
    cancelButton: { padding: 16, alignItems: "center" },
    cancelText: { fontWeight: "600" },
});
