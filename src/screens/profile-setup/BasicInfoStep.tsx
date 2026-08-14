import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { AppInput } from '../../components/ui/AppInput';
import { WizardHeader, OptionPicker, ListPickerModal } from './fields';
import { genderOptions, interestedInOptions, countriesOptions } from '../../constants/options';
import { Gender, InterestedIn } from '../../types/enums';
import { colors } from '../../constants/theme';
import { isValidDateOfBirth, isValidName } from '../../core/utils/validation';

interface BasicInfoStepProps {
  step: number;
  total: number;
  data: {
    displayName: string;
    dob: string;
    gender: Gender | '';
    interestedIn: InterestedIn | '';
    country: string;
    city: string;
  };
  onChange: (patch: Partial<BasicInfoStepProps['data']>) => void;
}

export function BasicInfoStep({ step, total, data, onChange }: BasicInfoStepProps) {
  const [countryOpen, setCountryOpen] = useState(false);
  const dobMs = data.dob ? new Date(data.dob).getTime() : 0;
  const dobError = data.dob ? (isValidDateOfBirth(dobMs) ? '' : 'You must be 18 or older') : '';
  const nameError = data.displayName ? (isValidName(data.displayName) ? '' : 'Enter at least 2 characters') : '';

  return (
    <View>
      <WizardHeader
        step={step}
        total={total}
        title="Tell us about you"
        subtitle="This helps us find people who match who you are."
        progress={(step / total) * 100}
      />

      <View style={styles.field}>
        <AppText variant="label" color={colors.textSecondary} style={styles.label}>
          Your name
        </AppText>
        <TextInput
          value={data.displayName}
          onChangeText={(t) => onChange({ displayName: t })}
          placeholder="First name"
          placeholderTextColor={colors.textTertiary}
          style={[styles.input, nameError ? styles.inputError : null]}
        />
        {nameError ? <AppText variant="caption" color={colors.red}>{nameError}</AppText> : null}
      </View>

      <View style={styles.field}>
        <AppText variant="label" color={colors.textSecondary} style={styles.label}>
          Date of birth
        </AppText>
        <TextInput
          value={data.dob}
          onChangeText={(t) => onChange({ dob: t })}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={colors.textTertiary}
          keyboardType="numbers-and-punctuation"
          style={[styles.input, dobError ? styles.inputError : null]}
        />
        {dobError ? <AppText variant="caption" color={colors.red}>{dobError}</AppText> : null}
      </View>

      <OptionPicker
        label="I am"
        options={genderOptions}
        value={data.gender}
        onChange={(v) => onChange({ gender: v })}
      />
      <OptionPicker
        label="Interested in"
        options={interestedInOptions}
        value={data.interestedIn}
        onChange={(v) => onChange({ interestedIn: v })}
      />

      <View style={styles.field}>
        <AppText variant="label" color={colors.textSecondary} style={styles.label}>
          Country
        </AppText>
        <Pressable style={styles.input} onPress={() => setCountryOpen(true)}>
          <AppText variant="body" color={data.country ? colors.white : colors.textTertiary}>
            {data.country || 'Select your country'}
          </AppText>
        </Pressable>
      </View>

      <AppInput
        label="City"
        placeholder="e.g. New York"
        value={data.city}
        onChangeText={(t) => onChange({ city: t })}
        icon="location-outline"
      />

      <ListPickerModal
        visible={countryOpen}
        onClose={() => setCountryOpen(false)}
        title="Select country"
        options={countriesOptions}
        value={data.country}
        onSelect={(v) => onChange({ country: v })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 18,
  },
  label: {
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.white,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
  },
  inputError: {
    borderColor: colors.red,
  },
});
