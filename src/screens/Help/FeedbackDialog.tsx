import React from "react";
import { Button, Dialog, Portal, TextInput } from "react-native-paper";
import { StyleSheet } from "react-native";

type FeedbackDialogProps = {
    visible: boolean;
    feedbackText: string;
    onChangeText: (text: string) => void;
    onDismiss: () => void;
    onSend: () => void;
};

export default function FeedbackDialog({
    visible,
    feedbackText,
    onChangeText,
    onDismiss,
    onSend,
}: FeedbackDialogProps) {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onDismiss}>
                <Dialog.Title>Send Feedback</Dialog.Title>
                <Dialog.Content>
                    <TextInput
                        mode="outlined"
                        placeholder="Describe the issue or suggestion"
                        value={feedbackText}
                        onChangeText={onChangeText}
                        multiline
                        numberOfLines={4}
                        style={styles.input}
                        accessibilityLabel="Feedback input"
                    />
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onDismiss}>Cancel</Button>
                    <Button onPress={onSend}>Send</Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}

const styles = StyleSheet.create({
    input: { minHeight: 100 },
});

