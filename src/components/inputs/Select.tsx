import React, { useMemo, useState } from 'react';
import { Keyboard, Pressable, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NativeSelectModal, { Option } from '../primitives/NativeSelectModal';

export type SelectProps = {
  label?: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options: Option[];
  clearable?: boolean;
};

export default function Select({ label, value, onChange, options, clearable = true }: SelectProps) {
  const [open, setOpen] = useState(false);

  const display = useMemo(() => {
    const found = options.find(o => String(o.value) === String(value));
    return String(found?.label ?? value ?? '');
  }, [options, value]);

  const handleOpen = () => {
    Keyboard.dismiss();
    setOpen(true);
  };

  return (
    <>
      <Pressable onPress={handleOpen} onTouchStart={handleOpen}>
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            placeholder={label}
            value={display}
            editable={false}
            right={
              <TextInput.Icon
                icon={({ color, size }) => (
                  <MaterialCommunityIcons name="chevron-down" size={size} color={color} />
                )}
                forceTextInputFocus={false}
              />
            }
            left={
              clearable && value ? (
                <TextInput.Icon
                  icon={({ color, size }) => (
                    <MaterialCommunityIcons name="close" size={size} color={color} />
                  )}
                  forceTextInputFocus={false}
                />
              ) : undefined
            }
          />
        </View>
      </Pressable>

      <NativeSelectModal
        visible={open}
        options={options}
        onSelect={(o) => {
          onChange(String(o.value));
          setOpen(false);
        }}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
