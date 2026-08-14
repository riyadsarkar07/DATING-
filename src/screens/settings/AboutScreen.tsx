import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { colors } from '../../constants/theme';

export function AboutScreen({ navigation }: any) {
  return (
    <Screen headerTitle="About SparkX" onBack={navigation.goBack} scroll>
      <View style={styles.logo}>
        <View style={styles.logoIcon}>
          <Ionicons name="flame" size={40} color="#FF3EA5" />
        </View>
        <AppText variant="display">SparkX</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Find your spark
        </AppText>
      </View>

      <View style={styles.info}>
        <AppText variant="body" color={colors.textSecondary} style={styles.text}>
          SparkX is a premium dating app that uses smart matching, real-time chat and video calls to help you find meaningful connections.
        </AppText>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <AppText variant="body" style={styles.rowLabel}>
            Version
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            1.0.0
          </AppText>
        </View>
        <View style={styles.row}>
          <AppText variant="body" style={styles.rowLabel}>
            Made with love
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>
            MonkeyCode-AI
          </AppText>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: { alignItems: 'center', marginTop: 24, marginBottom: 24 },
  logoIcon: {
    width: 84,
    height: 84,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginBottom: 12,
  },
  info: { marginBottom: 20 },
  text: { lineHeight: 20 },
  card: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  rowLabel: { color: colors.white },
});
