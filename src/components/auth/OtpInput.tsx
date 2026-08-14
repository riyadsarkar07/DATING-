import React, { useEffect, useRef, useState } from 'react';
import { View, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { colors, radius } from '../../constants/theme';

interface OtpInputProps {
  length?: number;
  value: string;
  onChangeText: (value: string) => void;
  onFilled?: (code: string) => void;
  keyboardType?: KeyboardTypeOptions;
}

export function OtpInput({
  length = 6,
  value,
  onChangeText,
  onFilled,
  keyboardType = 'number-pad',
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const digits = Array.from({ length }, (_, i) => value[i] ?? '');

  useEffect(() => {
    if (value.length === length) onFilled?.(value);
  }, [value, length, onFilled]);

  return (
    <View style={styles.container}>
      {digits.map((digit, i) => (
        <View
          key={i}
          style={[
            styles.box,
            digit ? styles.boxFilled : null,
            focused && i === value.length ? styles.boxFocused : null,
          ]}
        >
          <TextInput
            ref={i === 0 ? inputRef : undefined}
            style={styles.input}
            value={digit}
            maxLength={length}
            keyboardType={keyboardType}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && !value[i]) {
                const next = value.slice(0, i);
                onChangeText(next);
              }
            }}
            onChangeText={(t) => {
              const next = (value.slice(0, i) + t).slice(0, length);
              onChangeText(next);
            }}
            selectTextOnFocus
            caretHidden
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  box: {
    width: 48,
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    borderColor: colors.violet[500],
    backgroundColor: 'rgba(124,77,255,0.1)',
  },
  boxFocused: {
    borderColor: colors.blush[500],
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    color: colors.white,
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
  },
});
