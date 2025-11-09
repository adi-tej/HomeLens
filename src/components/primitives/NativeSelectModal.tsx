import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Easing,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "react-native-paper";

export type Option = { label?: string | number; value: string | number };

export type NativeSelectModalProps = {
    visible: boolean;
    options: Option[];
    onSelect: (o: Option) => void;
    onCancel: () => void;
    renderLabel?: (o: Option) => string;
};

export default function NativeSelectModal({
    visible,
    options,
    onSelect,
    onCancel,
    renderLabel,
}: NativeSelectModalProps) {
    const theme = useTheme();
    const isDark = theme.dark as unknown as boolean | undefined;
    const backdropColor = isDark ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0.3)";

    // Internal mount state to allow exit animation before unmounting Modal
    const [showModal, setShowModal] = useState<boolean>(visible);

    // Animated translateY for the sheet (slide up/down)
    const translateY = useRef(new Animated.Value(300)).current;

    // Ensure Modal mounts when `visible` becomes true
    useEffect(() => {
        if (visible) {
            setShowModal(true);
            // run entrance animation
            Animated.timing(translateY, {
                toValue: 0,
                duration: 260,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }).start();
        } else if (showModal) {
            // run exit animation then unmount
            Animated.timing(translateY, {
                toValue: 300,
                duration: 200,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: true,
            }).start(() => {
                setShowModal(false);
            });
        }
    }, [visible]);

    // Style applied to the animated sheet
    const sheetStyle = {
        transform: [{ translateY }],
    } as const;

    return (
        <Modal
            visible={showModal}
            animationType="fade"
            transparent
            onRequestClose={onCancel}
        >
            <Pressable
                style={[styles.backdrop, { backgroundColor: backdropColor }]}
                onPress={onCancel}
            >
                {/* Animated sheet stays anchored to bottom while backdrop is fixed */}
                <Animated.View
                    style={[
                        styles.container,
                        sheetStyle,
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
                                    { borderBottomColor: theme.colors.outline },
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
                        onPress={onCancel}
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
