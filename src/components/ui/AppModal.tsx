import React, { useEffect } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius } from '../../constants/theme';

interface AppModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showHandle?: boolean;
  heightRatio?: number;
  transparent?: boolean;
}

export function AppModal({
  visible,
  onClose,
  children,
  showHandle = true,
  heightRatio = 0.7,
}: AppModalProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: 280 });
  }, [visible, progress]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: (1 - progress.value) * 900,
      },
    ],
  }));

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <Pressable style={styles.backdropPress} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.sheet, { height: `${heightRatio * 100}%` }, sheetStyle]}>
          {showHandle ? <View style={styles.handle} /> : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropPress: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.ink[800],
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    overflow: 'hidden',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
});
