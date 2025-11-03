import React, { useEffect, useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { TextInput, useTheme } from "react-native-paper";
import NativeSelectModal, { Option } from "../primitives/NativeSelectModal";
import { formatCurrency, parseNumber } from "../../utils/parser";

export type CurrencySelectProps = {
  label?: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  presets?: number[]; // optional overrides
  allowPresets?: boolean;
};

const DEFAULT_PRESETS = [400000, 600000, 800000, 1000000, 1200000];

export default function CurrencySelect({
  label,
  value,
  onChange,
  presets,
  allowPresets = true,
}: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [text, setText] = useState(value != null ? formatCurrency(value) : "");
  const theme = useTheme();

  useEffect(() => {
    setText(value != null ? formatCurrency(value) : "");
  }, [value]);

  const options: Option[] = useMemo(() => {
    const list = (presets ?? DEFAULT_PRESETS).map((n) => ({
      value: n,
      label: formatCurrency(n),
    }));
    return list as Option[];
  }, [presets]);

  const handleTextChange = (t: string) => {
    const parsed = parseNumber(t);
    if (parsed !== undefined) {
      setText(formatCurrency(parsed));
      onChange(parsed);
    } else {
      setText(t);
      if (t === "") onChange(undefined);
    }
  };

  const handleSelect = (o: Option) => {
    const val = Number(o.value);
    setText(formatCurrency(val));
    onChange(val);
    setOpen(false);
  };

  const isActive = open || focused;
  const outlineColor = isActive ? theme.colors.primary : theme.colors.outline;

  return (
    <>
      <TextInput
        mode="outlined"
        label={label}
        placeholder={label}
        value={text}
        onChangeText={handleTextChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        keyboardType={Platform.select({
          ios: "number-pad",
          android: "numeric",
        })}
        outlineColor={outlineColor}
        activeOutlineColor={theme.colors.primary}
        outlineStyle={{
          borderWidth: isActive ? 2 : 1,
        }}
        right={
          allowPresets ? (
            <TextInput.Icon
              icon="chevron-down"
              onPress={() => {
                if (!options.length) return;
                Keyboard.dismiss();
                setOpen(true);
              }}
              forceTextInputFocus={false}
            />
          ) : undefined
        }
      />

      <NativeSelectModal
        visible={open}
        options={options}
        onSelect={handleSelect}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
