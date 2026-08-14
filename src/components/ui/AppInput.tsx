import React, { useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TextInputProps,
  Pressable,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from './AppText';
import { colors, radius } from '../../constants/theme';

interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  secure?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function AppInput({
  label,
  error,
  icon,
  secure,
  containerStyle,
  style,
  ...rest
}: AppInputProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(Boolean(secure));

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <AppText variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </AppText>
      ) : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          error ? styles.fieldError : null,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={focused ? colors.violet[400] : colors.textTertiary}
          />
        ) : null}
        <TextInput
          {...rest}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={hidden}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, style]}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((v) => !v)} hitSlop={10}>
            <Ionicons
              name={hidden ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" color={colors.red} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  fieldFocused: {
    borderColor: colors.violet[500],
    backgroundColor: 'rgba(124,77,255,0.08)',
  },
  fieldError: {
    borderColor: colors.red,
  },
  input: {
    flex: 1,
    color: colors.white,
    fontSize: 15,
    paddingVertical: 14,
    fontFamily: 'Poppins_400Regular',
  },
  error: {
    marginTop: 6,
  },
});
