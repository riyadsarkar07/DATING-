import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { AppText } from '../../components/ui/AppText';
import { AppInput } from '../../components/ui/AppInput';
import { WizardHeader, OptionPicker, MultiOptionPicker, ListPickerModal } from './fields';
import {
  religionOptions,
  educationOptions,
  relationshipGoalOptions,
  languagesOptions,
  heightOptions,
} from '../../constants/options';
import { Education, RelationshipGoal } from '../../types/enums';
import { colors } from '../../constants/theme';
import { heightLabel } from '../../core/utils/format';
import { isValidBio } from '../../core/utils/validation';

interface AboutStepProps {
  step: number;
  total: number;
  data: {
    bio: string;
    height: string;
    religion: string;
    education: Education | '';
    occupation: string;
    languages: string[];
    relationshipGoal: RelationshipGoal | '';
  };
  onChange: (patch: Partial<AboutStepProps['data']>) => void;
}

export function AboutStep({ step, total, data, onChange }: AboutStepProps) {
  const [heightOpen, setHeightOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const bioValid = data.bio ? (isValidBio(data.bio) ? '' : 'Write at least 20 characters') : '';

  return (
    <View>
      <WizardHeader
        step={step}
        total={total}
        title="Your story"
        subtitle="Share what makes you, you."
        progress={(step / total) * 100}
      />

      <View style={styles.field}>
        <AppText variant="label" color={colors.textSecondary} style={styles.label}>
          Bio <AppText variant="caption" color={colors.textTertiary}>({data.bio.length}/150)</AppText>
        </AppText>
        <TextInput
          value={data.bio}
          onChangeText={(t) => onChange({ bio: t.slice(0, 150) })}
          placeholder="Tell people what you're passionate about, your vibe, and what you're looking for..."
          placeholderTextColor={colors.textTertiary}
          multiline
          maxLength={150}
          style={[styles.textarea, bioValid ? styles.inputError : null]}
        />
        {bioValid ? <AppText variant="caption" color={colors.red}>{bioValid}</AppText> : null}
      </View>

      <View style={styles.field}>
        <AppText variant="label" color={colors.textSecondary} style={styles.label}>
          Height
        </AppText>
        <Pressable style={styles.input} onPress={() => setHeightOpen(true)}>
          <AppText variant="body" color={data.height ? colors.white : colors.textTertiary}>
            {data.height ? heightLabel(Number(data.height)) : 'Select your height'}
          </AppText>
        </Pressable>
      </View>

      <OptionPicker
        label="Religion"
        options={religionOptions.map((r) => ({ value: r, label: r }))}
        value={data.religion}
        onChange={(v) => onChange({ religion: v })}
      />
      <OptionPicker
        label="Education"
        options={educationOptions}
        value={data.education}
        onChange={(v) => onChange({ education: v })}
      />

      <AppInput
        label="Occupation"
        placeholder="e.g. Product Designer"
        value={data.occupation}
        onChangeText={(t) => onChange({ occupation: t })}
        icon="briefcase-outline"
      />

      <View style={styles.field}>
        <AppText variant="label" color={colors.textSecondary} style={styles.label}>
          Languages you speak
        </AppText>
        <Pressable style={styles.input} onPress={() => setLanguageOpen(true)}>
          <AppText variant="body" color={data.languages.length ? colors.white : colors.textTertiary}>
            {data.languages.length ? data.languages.join(', ') : 'Select languages'}
          </AppText>
        </Pressable>
      </View>

      <OptionPicker
        label="Relationship goal"
        options={relationshipGoalOptions}
        value={data.relationshipGoal}
        onChange={(v) => onChange({ relationshipGoal: v })}
      />

      <ListPickerModal
        visible={heightOpen}
        onClose={() => setHeightOpen(false)}
        title="Select height"
        options={heightOptions.map((h) => `${h}`)}
        value={data.height}
        labels={Object.fromEntries(heightOptions.map((h) => [`${h}`, heightLabel(h)]))}
        onSelect={(v) => onChange({ height: v })}
      />
      <ListPickerModal
        visible={languageOpen}
        onClose={() => setLanguageOpen(false)}
        title="Select languages"
        options={languagesOptions}
        value=""
        onSelect={(v) => {
          if (data.languages.includes(v)) {
            onChange({ languages: data.languages.filter((l) => l !== v) });
          } else if (data.languages.length < 5) {
            onChange({ languages: [...data.languages, v] });
          }
        }}
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
  textarea: {
    minHeight: 110,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.white,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    textAlignVertical: 'top',
  },
  input: {
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputError: {
    borderColor: colors.red,
  },
});
