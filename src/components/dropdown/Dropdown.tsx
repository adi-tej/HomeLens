import React from 'react';
import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type DropdownProps = {
  label?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onClear?: () => void;
  onOpen?: () => void;
  editable?: boolean; // default false
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  style?: any;
};

export default function Dropdown({
  label,
  value = '',
  onChangeText,
  onClear,
  onOpen,
  editable = false,
  keyboardType = 'default',
  style,
}: DropdownProps) {
  const showClear = value !== '' && !!onClear;

  return (
    <TextInput
      mode="outlined"
      label={label}
      placeholder={label}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      keyboardType={keyboardType}
      onPressIn={() => !editable && onOpen?.()}
      right={
        !!onOpen ? (
          <TextInput.Icon
            icon={({ color, size }) => (
              <MaterialCommunityIcons name="chevron-down" size={size} color={color} />
            )}
            onPress={onOpen}
            forceTextInputFocus={false}
          />
        ) : undefined
      }
      left={
        showClear ? (
          <TextInput.Icon
            icon={({ color, size }) => (
              <MaterialCommunityIcons name="close" size={size} color={color} />
            )}
            onPress={onClear}
            forceTextInputFocus={false}
          />
        ) : undefined
      }
      style={style}
      accessibilityRole={!editable ? 'button' : undefined}
    />
  );
}
