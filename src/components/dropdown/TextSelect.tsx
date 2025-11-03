import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import Dropdown from './Dropdown';
import NativeSelectModal, { Option } from './NativeSelectModal';

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
    options.find(o => String(o.value) === String(value))?.label ??
    (value ?? '');

  const handleSelect = (o: Option) => {
    onChange(String(o.value));
    setOpen(false);
  };

  return (
    <>
      <Dropdown
        label={label}
        value={String(display ?? '')}
        onOpen={() => {
          Keyboard.dismiss();
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
