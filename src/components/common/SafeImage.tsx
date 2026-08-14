import React, { useState } from 'react';
import { View, Image, StyleSheet, StyleProp, ImageStyle } from 'react-native';
import FastImage, { ImageStyle as FastImageStyle } from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

interface SafeImageProps {
  uri?: string | null;
  style?: StyleProp<FastImageStyle>;
  resizeMode?: 'cover' | 'contain';
  priority?: 'low' | 'normal' | 'high';
  fallbackIcon?: keyof typeof Ionicons.glyphMap;
}

export function SafeImage({
  uri,
  style,
  resizeMode = 'cover',
  priority = 'normal',
  fallbackIcon = 'person',
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!uri || failed) {
    return (
      <View style={[styles.fallback, style]}>
        <Ionicons name={fallbackIcon} size={32} color={colors.textTertiary} />
      </View>
    );
  }

  return (
    <FastImage
      source={{
        uri,
        priority:
          priority === 'high'
            ? FastImage.priority.high
            : priority === 'low'
              ? FastImage.priority.low
              : FastImage.priority.normal,
      }}
      style={style}
      resizeMode={resizeMode === 'cover' ? FastImage.resizeMode.cover : FastImage.resizeMode.contain}
      onError={() => setFailed(true)}
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    backgroundColor: colors.ink[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
