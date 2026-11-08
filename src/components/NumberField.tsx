import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { colors, fonts, radius } from '@/theme';
import { Label } from './ui';

/** Compact numeric input used in set rows. Commits on blur / submit. */
export function NumberField({
  value,
  onChange,
  label,
  decimals = false,
  width = 72,
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
  decimals?: boolean;
  width?: number;
}) {
  const [text, setText] = useState(String(value));
  // resync the text when the value changes from outside (adjusting state during render)
  const [prev, setPrev] = useState(value);
  if (prev !== value) {
    setPrev(value);
    setText(String(value));
  }

  const commit = () => {
    const n = decimals ? parseFloat(text.replace(',', '.')) : parseInt(text, 10);
    if (Number.isFinite(n) && n >= 0) onChange(decimals ? Math.round(n * 100) / 100 : n);
    else setText(String(value));
  };

  return (
    <View style={{ alignItems: 'center', gap: 2 }}>
      <TextInput
        cursorColor={colors.accent}
        selectionColor={colors.accent}
        selectionHandleColor={colors.accent}
        value={text}
        onChangeText={setText}
        onBlur={commit}
        onSubmitEditing={commit}
        keyboardType={decimals ? 'decimal-pad' : 'number-pad'}
        selectTextOnFocus
        accessibilityLabel={label}
        style={{
          width,
          textAlign: 'center',
          fontFamily: fonts.display,
          fontSize: 22,
          color: colors.text,
          backgroundColor: colors.surfaceHigh,
          borderRadius: radius.sm,
          paddingVertical: 6,
        }}
      />
      {label ? <Label style={{ fontSize: 9 }}>{label}</Label> : null}
    </View>
  );
}
