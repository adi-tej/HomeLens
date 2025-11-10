import React, { ReactNode, useEffect } from "react";
import { Pressable, useWindowDimensions } from "react-native";
import Reanimated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useTheme } from "react-native-paper";

interface OverlayPanelProps {
    visible: boolean;
    onClose: () => void;
    children: ReactNode;
}

/**
 * OverlayPanel - A generic reusable slide-in panel overlay
 * Slides in from the right with a backdrop scrim
 * Can be used for any full-screen slide-in content
 */
export default function OverlayPanel({
    visible,
    onClose,
    children,
}: OverlayPanelProps) {
    const { width: windowWidth } = useWindowDimensions();
    const theme = useTheme();

    const progress = useSharedValue(visible ? 1 : 0);

    useEffect(() => {
        progress.value = withSpring(visible ? 1 : 0, {
            damping: 18,
            stiffness: 240,
            overshootClamping: true,
        });
    }, [visible, progress]);

    const scrimStyle = useAnimatedStyle(() => ({
        opacity: progress.value * 0.5,
    }));

    const panelStyle = useAnimatedStyle(() => ({
        transform: [
            {
                translateX: (1 - progress.value) * windowWidth,
            },
        ],
    }));

    return (
        <>
            <Reanimated.View
                pointerEvents={visible ? "auto" : "none"}
                style={[
                    {
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1000,
                        backgroundColor: theme.colors.backdrop,
                    },
                    scrimStyle,
                ]}
            >
                <Pressable style={{ flex: 1 }} onPress={onClose} />
            </Reanimated.View>

            <Reanimated.View
                pointerEvents={visible ? "auto" : "none"}
                style={[
                    {
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 1001,
                        backgroundColor: "transparent",
                    },
                    panelStyle,
                ]}
                collapsable={false}
                renderToHardwareTextureAndroid
            >
                {children}
            </Reanimated.View>
        </>
    );
}
