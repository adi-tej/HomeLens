import React, { useState } from "react";
import { Keyboard } from "react-native";
import * as Haptics from "expo-haptics";
import Dropdown from "../primitives/Dropdown";
import NativeSelectModal, { Option } from "../primitives/NativeSelectModal";

export type TextSelectProps = {
  label?: string;
  value?: string;
  onChange: (v: string | undefined) => void;
  options?: Option[];
};

export default function TextSelect({
  label,
  value,
  onChange,
  options = [],
}: TextSelectProps) {
  const [open, setOpen] = useState(false);

  const display =
    options.find((o) => String(o.value) === String(value))?.label ??
    value ??
    "";

  const handleSelect = (o: Option) => {
    onChange(String(o.value));
    setOpen(false);
  };

  return (
    <>
      <Dropdown
        label={label}
        value={String(display ?? "")}
        onOpen={() => {
          Keyboard.dismiss();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(true);
        }}
        onClear={() => {
          onChange(undefined);
        }}
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
