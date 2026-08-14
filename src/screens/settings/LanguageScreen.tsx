import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { useSettingsStore } from '../../store/settings.store';
import { useAppStore } from '../../store/app.store';
import { AppLanguage } from '../../types/enums';
import { colors } from '../../constants/theme';

const LANGUAGES: { code: AppLanguage; name: string; native: string }[] = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'pt', name: 'Portuguese', native: 'Português' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'ja', name: 'Japanese', native: '日本語' },
  { code: 'ko', name: 'Korean', native: '한국어' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
];

export function LanguageScreen({ navigation }: any) {
  const language = useSettingsStore((s) => s.settings?.language ?? 'en');
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const showToast = useAppStore((s) => s.showToast);

  const select = async (code: AppLanguage) => {
    await setLanguage(code);
    showToast('Language updated', 'success');
    navigation.goBack();
  };

  return (
    <Screen headerTitle="Language" onBack={navigation.goBack}>
      <View style={styles.group}>
        {LANGUAGES.map((lang) => {
          const active = language === lang.code;
          return (
            <Pressable
              key={lang.code}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
              onPress={() => select(lang.code)}
            >
              <View style={styles.flag}>
                <Ionicons name="language" size={16} color={colors.violet[400]} />
              </View>
              <View style={{ flex: 1 }}>
                <AppText variant="body">{lang.name}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {lang.native}
                </AppText>
              </View>
              {active ? <Ionicons name="checkmark-circle" size={22} color={colors.violet[400]} /> : null}
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  flag: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(124,58,237,0.12)',
  },
});
