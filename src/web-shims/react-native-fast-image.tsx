import React from 'react';
import { Image } from 'react-native';

export const resizeMode = {
  contain: 'contain',
  cover: 'cover',
  stretch: 'stretch',
  center: 'center',
} as const;

export const priority = {
  low: 'low',
  normal: 'normal',
  high: 'high',
} as const;

type ResizeMode = typeof resizeMode[keyof typeof resizeMode];
type Priority = typeof priority[keyof typeof priority];

export interface ImageStyle {
  // Mirror the shape used by FastImage consumers; delegated to RN Image styles.
  [key: string]: any;
}

export interface FastImageSource {
  uri?: string;
  priority?: Priority;
  headers?: Record<string, string>;
}

export interface FastImageProps {
  source?: FastImageSource | number;
  style?: ImageStyle | ImageStyle[];
  resizeMode?: ResizeMode;
  onLoad?: () => void;
  onError?: () => void;
  children?: React.ReactNode;
}

function FastImage({ source, style, resizeMode: rm = 'cover', onLoad, onError }: FastImageProps) {
  const uri = typeof source === 'object' && source !== null ? source.uri : undefined;
  return (
    <Image
      source={uri ? { uri } : (source as any)}
      style={style as any}
      resizeMode={rm as any}
      onLoad={onLoad}
      onError={onError}
    />
  );
}

FastImage.resizeMode = resizeMode;
FastImage.priority = priority;
FastImage.preload = () => Promise.resolve();
FastImage.clearMemoryCache = () => Promise.resolve();
FastImage.clearDiskCache = () => Promise.resolve();

export default FastImage;
