import React from "react";
import {
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
    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent
            onRequestClose={onCancel}
        >
            <Pressable
                style={[styles.backdrop, { backgroundColor: backdropColor }]}
                onPress={onCancel}
            >
                <View
                    style={[
                        styles.container,
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
                </View>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
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
