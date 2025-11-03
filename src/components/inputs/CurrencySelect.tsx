import React, { useState, useEffect } from "react";
import { Keyboard } from "react-native";
import Dropdown from "../primitives/Dropdown";
import NativeSelectModal, { Option } from "../primitives/NativeSelectModal";
import { formatCurrency, parseNumber } from "../../utils/parser";

export type CurrencySelectProps = {
  label?: string;
  value?: number;
  onChange: (v: number | undefined) => void;
  options?: Option[];
};

export default function CurrencySelect({
  label,
  value,
  onChange,
  options = [],
}: CurrencySelectProps) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(value != null ? formatCurrency(value) : "");

  useEffect(() => {
    setText(value != null ? formatCurrency(value) : "");
  }, [value]);

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
      <Dropdown
        label={label}
        value={text}
        onChangeText={handleTextChange}
        onOpen={() => {
          if (options.length === 0) return;
          Keyboard.dismiss();
          setOpen(true);
        }}
        onClear={() => {
          setText("");
          onChange(undefined);
        }}
        editable
        keyboardType="numeric"
      />

      <NativeSelectModal
        visible={open}
        options={options.map((o) => ({
          label: o.label ?? formatCurrency(Number(o.value)),
          value: o.value,
        }))}
        onSelect={handleSelect}
        onCancel={() => setOpen(false)}
        renderLabel={(o) =>
          typeof o.label === "number"
            ? formatCurrency(Number(o.label))
            : String(o.label)
        }
      />
    </>
  );
}
