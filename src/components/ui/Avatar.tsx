import React from 'react';
import { View, StyleSheet } from 'react-native';
import FastImage, { ImageStyle as FastImageStyle } from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

interface AvatarProps {
  uri?: string | null;
  size?: number;
  online?: boolean;
  style?: FastImageStyle;
}

export function Avatar({ uri, size = 48, online, style }: AvatarProps) {
  return (
    <View style={{ width: size, height: size }}>
      {uri ? (
        <FastImage
          source={{ uri }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
            style,
          ]}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 },
          ]}
        >
          <Ionicons name="person" size={size * 0.5} color={colors.textTertiary} />
        </View>
      )}
      {online ? (
        <View
          style={[
            styles.online,
            {
              width: size * 0.24,
              height: size * 0.24,
              borderRadius: size * 0.12,
              borderWidth: 2,
              bottom: size * 0.02,
              right: size * 0.02,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: colors.ink[700],
  },
  placeholder: {
    backgroundColor: colors.ink[700],
    alignItems: 'center',
    justifyContent: 'center',
  },
  online: {
    position: 'absolute',
    backgroundColor: colors.green,
    borderColor: colors.ink[900],
  },
});
