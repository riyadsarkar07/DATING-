import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { colors, layout } from '../../constants/theme';

interface AuthShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onBack?: () => void;
}

export function AuthShell({ title, subtitle, children, footer, onBack }: AuthShellProps) {
  return (
    <LinearGradient colors={['#05050A', '#140A24']} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={12} style={styles.back}>
                <Ionicons name="chevron-back" size={22} color={colors.white} />
              </Pressable>
            ) : null}
            <View style={styles.brand}>
              <AppText variant="title" style={styles.logo}>
                Spark<AppText variant="title" color={colors.blush[500]}>X</AppText>
              </AppText>
            </View>
            <AppText variant="title" centered style={styles.title}>
              {title}
            </AppText>
            <AppText variant="body" color={colors.textSecondary} centered style={styles.subtitle}>
              {subtitle}
            </AppText>
            <View style={styles.form}>{children}</View>
          </ScrollView>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 24,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    letterSpacing: 1,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 28,
    maxWidth: 300,
    alignSelf: 'center',
  },
  form: {
    gap: 16,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 16,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
});
