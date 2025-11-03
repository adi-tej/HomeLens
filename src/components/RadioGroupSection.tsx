import React from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, RadioButton, Text } from 'react-native-paper';

export type RadioOption = { label: string; value: string };

export default function RadioGroupSection({
  title,
  value,
  onChange,
  options,
  error,
  touched,
}: {
  title: string;
  value: string;
  onChange: (v: string) => void;
  options: RadioOption[];
  error?: string;
  touched?: boolean;
}) {
  return (
    <View>
      <Text variant="titleMedium" style={styles.sectionLabel}>{title}</Text>
      <RadioButton.Group value={value} onValueChange={onChange}>
        {options.map((o) => (
          <View key={o.value} style={styles.radioRow}>
            <RadioButton value={o.value} />
            <Text style={styles.radioLabel}>{o.label}</Text>
          </View>
        ))}
      </RadioButton.Group>
      <HelperText type="error" visible={!!touched && !!error}>{error}</HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { marginBottom: 6, marginTop: 4 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 2 },
  radioLabel: { marginLeft: 6 },
});
