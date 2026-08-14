import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../../components/ui/Screen';
import { AppText } from '../../components/ui/AppText';
import { GradientButton } from '../../components/ui/GradientButton';
import { OptionPicker, ListPickerModal } from '../profile-setup/fields';
import { useDiscoveryStore } from '../../store/discovery.store';
import { DiscoverFilter } from '../../types/filters';
import { DiscoverSort } from '../../types/enums';
import {
  genderOptions,
  interestedInOptions,
  religionOptions,
  educationOptions,
  countriesOptions,
  languagesOptions,
} from '../../constants/options';
import { colors, radius } from '../../constants/theme';

const SORTS: { key: DiscoverSort; label: string }[] = [
  { key: 'suggested', label: 'Suggested' },
  { key: 'trending', label: 'Trending' },
  { key: 'nearby', label: 'Nearby' },
  { key: 'verified', label: 'Verified' },
  { key: 'recent', label: 'Recent' },
  { key: 'premium', label: 'Premium' },
];

export function DiscoverFiltersScreen() {
  const navigation = useNavigation();
  const current = useDiscoveryStore((s) => s.filter);
  const setFilter = useDiscoveryStore((s) => s.setFilter);

  const [f, setF] = useState<DiscoverFilter>({ ...current });
  const [countryOpen, setCountryOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  const toggle = (key: 'verifiedOnly' | 'premiumOnly') => {
    setF((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = () => {
    setFilter({ ...f });
    navigation.goBack();
  };

  const reset = () => {
    setF({ ...current, minAge: 18, maxAge: 45, maxDistanceKm: 100, gender: null, religion: null, education: null, country: null, language: null, verifiedOnly: false, premiumOnly: false, sortBy: 'suggested' });
  };

  return (
    <Screen headerTitle="Discover Filters" onBack={() => navigation.goBack()} scroll>
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <AppText variant="subheading">Age range</AppText>
          <AppText variant="label" color={colors.violet[300]}>
            {f.minAge} - {f.maxAge}
          </AppText>
        </View>
        <Slider
          minimumValue={18}
          maximumValue={60}
          step={1}
          value={f.minAge}
          onValueChange={(v) => setF((prev) => ({ ...prev, minAge: v, maxAge: Math.max(v, prev.maxAge) }))}
          minimumTrackTintColor="#7C4DFF"
          maximumTrackTintColor={colors.surfaceGlassStrong}
          thumbTintColor="#FF3EA5"
        />
        <Slider
          minimumValue={18}
          maximumValue={60}
          step={1}
          value={f.maxAge}
          onValueChange={(v) => setF((prev) => ({ ...prev, maxAge: v, minAge: Math.min(v, prev.minAge) }))}
          minimumTrackTintColor="#7C4DFF"
          maximumTrackTintColor={colors.surfaceGlassStrong}
          thumbTintColor="#FF3EA5"
        />
      </View>

      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <AppText variant="subheading">Max distance</AppText>
          <AppText variant="label" color={colors.violet[300]}>
            {f.maxDistanceKm >= 500 ? 'Anywhere' : `${f.maxDistanceKm} km`}
          </AppText>
        </View>
        <Slider
          minimumValue={5}
          maximumValue={500}
          step={5}
          value={f.maxDistanceKm}
          onValueChange={(v) => setF((prev) => ({ ...prev, maxDistanceKm: v }))}
          minimumTrackTintColor="#7C4DFF"
          maximumTrackTintColor={colors.surfaceGlassStrong}
          thumbTintColor="#00D1FF"
        />
      </View>

      <View style={styles.section}>
        <AppText variant="subheading" style={styles.sectionTitle}>Sort by</AppText>
        <View style={styles.chips}>
          {SORTS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => setF((prev) => ({ ...prev, sortBy: s.key }))}
              style={[styles.chip, f.sortBy === s.key && styles.chipActive]}
            >
              <AppText variant="label" color={f.sortBy === s.key ? colors.white : colors.textSecondary}>
                {s.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </View>

      <OptionPicker
        label="Gender"
        options={[{ value: '', label: 'Any' } as any, ...genderOptions]}
        value={f.gender ?? ''}
        onChange={(v) => setF((prev) => ({ ...prev, gender: v || null }))}
      />
      <OptionPicker
        label="Interested in"
        options={[{ value: '', label: 'Any' } as any, ...interestedInOptions]}
        value={f.interestedIn ?? ''}
        onChange={(v) => setF((prev) => ({ ...prev, interestedIn: v || null }))}
      />
      <OptionPicker
        label="Religion"
        options={[{ value: '', label: 'Any' } as any, ...religionOptions.map((r) => ({ value: r, label: r }))]}
        value={f.religion ?? ''}
        onChange={(v) => setF((prev) => ({ ...prev, religion: v || null }))}
      />
      <OptionPicker
        label="Education"
        options={[{ value: '', label: 'Any' } as any, ...educationOptions]}
        value={f.education ?? ''}
        onChange={(v) => setF((prev) => ({ ...prev, education: v || null }))}
      />

      <View style={styles.section}>
        <AppText variant="label" color={colors.textSecondary} style={styles.sectionTitle}>
          Country
        </AppText>
        <Pressable style={styles.picker} onPress={() => setCountryOpen(true)}>
          <AppText variant="body" color={f.country ? colors.white : colors.textTertiary}>
            {f.country || 'Any country'}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.section}>
        <AppText variant="label" color={colors.textSecondary} style={styles.sectionTitle}>
          Language
        </AppText>
        <Pressable style={styles.picker} onPress={() => setLanguageOpen(true)}>
          <AppText variant="body" color={f.language ? colors.white : colors.textTertiary}>
            {f.language || 'Any language'}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.toggles}>
        <ToggleRow
          label="Verified only"
          value={f.verifiedOnly}
          onChange={() => toggle('verifiedOnly')}
        />
        <ToggleRow
          label="Premium members only"
          value={f.premiumOnly}
          onChange={() => toggle('premiumOnly')}
        />
      </View>

      <GradientButton title="Apply Filters" onPress={save} style={styles.apply} />
      <Pressable onPress={reset} hitSlop={8} style={styles.reset}>
        <AppText variant="label" centered color={colors.textSecondary}>
          Reset filters
        </AppText>
      </Pressable>

      <ListPickerModal
        visible={countryOpen}
        onClose={() => setCountryOpen(false)}
        title="Select country"
        options={countriesOptions}
        value={f.country ?? ''}
        onSelect={(v) => setF((prev) => ({ ...prev, country: v }))}
      />
      <ListPickerModal
        visible={languageOpen}
        onClose={() => setLanguageOpen(false)}
        title="Select language"
        options={languagesOptions}
        value={f.language ?? ''}
        onSelect={(v) => setF((prev) => ({ ...prev, language: v }))}
      />
    </Screen>
  );
}

function ToggleRow({ label, value, onChange }: { label: string; value: boolean; onChange: () => void }) {
  return (
    <Pressable style={styles.toggleRow} onPress={onChange}>
      <AppText variant="body">{label}</AppText>
      <View style={[styles.toggle, value && styles.toggleOn]}>
        <View style={[styles.toggleDot, value && styles.toggleDotOn]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  chipActive: {
    backgroundColor: colors.violet[600],
    borderColor: colors.violet[500],
  },
  picker: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: radius.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggles: {
    gap: 10,
    marginBottom: 20,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggle: {
    width: 46,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.surfaceGlassStrong,
    padding: 2,
  },
  toggleOn: {
    backgroundColor: colors.violet[600],
  },
  toggleDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.textTertiary,
  },
  toggleDotOn: {
    backgroundColor: colors.white,
    alignSelf: 'flex-end',
  },
  apply: {
    marginBottom: 12,
  },
  reset: {
    marginBottom: 12,
  },
});
