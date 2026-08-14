import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors } from '../../constants/theme';

type Variant =
  | 'display'
  | 'title'
  | 'heading'
  | 'subheading'
  | 'body'
  | 'label'
  | 'caption';

const FONT_FAMILY: Record<Variant, string> = {
  display: 'Poppins_800ExtraBold',
  title: 'Poppins_700Bold',
  heading: 'Poppins_700Bold',
  subheading: 'Poppins_600SemiBold',
  body: 'Poppins_400Regular',
  label: 'Poppins_500Medium',
  caption: 'Poppins_500Medium',
};

const FONT_SIZE: Record<Variant, number> = {
  display: 38,
  title: 28,
  heading: 22,
  subheading: 17,
  body: 15,
  label: 13,
  caption: 11,
};

const LINE_HEIGHT: Record<Variant, number> = {
  display: 48,
  title: 36,
  heading: 30,
  subheading: 24,
  body: 22,
  label: 18,
  caption: 16,
};

interface AppTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  centered?: boolean;
  numberOfLines?: number;
}

export function AppText({
  variant = 'body',
  color = colors.white,
  centered,
  style,
  ...rest
}: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[
        {
          fontFamily: FONT_FAMILY[variant],
          fontSize: FONT_SIZE[variant],
          lineHeight: LINE_HEIGHT[variant],
          color,
          textAlign: centered ? 'center' : undefined,
        },
        style,
      ]}
    />
  );
}
