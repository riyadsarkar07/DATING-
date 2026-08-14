import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText } from './AppText';
import { colors } from '../../constants/theme';

export function Spinner({ size = 'large', label }: { size?: 'small' | 'large'; label?: string }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#7C4DFF', '#FF3EA5']}
        style={styles.ring}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.inner}>
          <ActivityIndicator color={colors.white} size={size === 'large' ? 'large' : 'small'} />
        </View>
      </LinearGradient>
      {label ? (
        <AppText variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  ring: {
    width: 64,
    height: 64,
    borderRadius: 32,
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.ink[900],
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    marginTop: 12,
  },
});
