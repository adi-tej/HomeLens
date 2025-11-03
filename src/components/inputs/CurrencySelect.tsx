import React, { useEffect, useMemo, useState } from "react";
import { Keyboard, Platform } from "react-native";
import { TextInput } from "react-native-paper";
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
  const [text, setText] = useState(value != null ? formatCurrency(value) : "");

  useEffect(() => {
    setText(value != null ? formatCurrency(value) : "");
  }, [value]);

  const options: Option[] = useMemo(() => {
    const list = (presets ?? DEFAULT_PRESETS).map((n) => ({ value: n, label: formatCurrency(n) }));
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

  return (
    <>
      <TextInput
        mode="outlined"
        label={label}
        placeholder={label}
        value={text}
        onChangeText={handleTextChange}
        keyboardType={Platform.select({ ios: "number-pad", android: "numeric" })}
        left={
          text ? (
            <TextInput.Icon
              icon="close"
              onPress={() => {
                setText("");
                onChange(undefined);
              }}
              forceTextInputFocus={false}
            />
          ) : undefined
        }
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
