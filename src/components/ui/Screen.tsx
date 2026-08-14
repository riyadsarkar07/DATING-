import React from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  StyleProp,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';
import { AppText } from '../ui/AppText';
import { colors, layout } from '../../constants/theme';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  headerTitle?: string;
  subtitle?: string;
  onBack?: () => void;
  headerRight?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  keyboardAvoid?: boolean;
  footer?: React.ReactNode;
}

export function Screen({
  children,
  scroll,
  headerTitle,
  subtitle,
  onBack,
  headerRight,
  style,
  contentStyle,
  keyboardAvoid,
  footer,
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: 40 },
        contentStyle,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, { flex: 1 }, contentStyle]}>{children}</View>
  );

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={[styles.safe, style]} edges={['top', 'left', 'right', 'bottom']}>
        {headerTitle ? (
          <View style={styles.header}>
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={12} style={styles.headerBtn}>
                <Ionicons name="chevron-back" size={22} color={colors.white} />
              </Pressable>
            ) : (
              <View style={styles.headerBtn} />
            )}
            <View style={styles.headerCenter}>
              <AppText variant="subheading">{headerTitle}</AppText>
              {subtitle ? (
                <AppText variant="caption" color={colors.textSecondary}>
                  {subtitle}
                </AppText>
              ) : null}
            </View>
            {headerRight ?? <View style={styles.headerBtn} />}
          </View>
        ) : null}

        {keyboardAvoid ? (
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            {body}
          </KeyboardAvoidingView>
        ) : (
          body
        )}

        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 12,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 8,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
});
