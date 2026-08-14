import React from 'react';
import { View } from 'react-native';
import { WizardHeader, OptionPicker, MultiOptionPicker } from './fields';
import { smokingOptions, drinkingOptions, petOptions, hobbyOptions } from '../../constants/options';

interface LifestyleStepProps {
  step: number;
  total: number;
  data: {
    smoking: string;
    drinking: string;
    pets: string[];
    hobbies: string[];
  };
  onChange: (patch: Partial<LifestyleStepProps['data']>) => void;
}

export function LifestyleStep({ step, total, data, onChange }: LifestyleStepProps) {
  return (
    <View>
      <WizardHeader
        step={step}
        total={total}
        title="Your lifestyle"
        subtitle="Great matches share more than photos. Help us get to know the real you."
        progress={(step / total) * 100}
      />

      <OptionPicker
        label="Smoking"
        options={smokingOptions}
        value={data.smoking}
        onChange={(v) => onChange({ smoking: v })}
      />
      <OptionPicker
        label="Drinking"
        options={drinkingOptions}
        value={data.drinking}
        onChange={(v) => onChange({ drinking: v })}
      />
      <MultiOptionPicker
        label="Pets"
        options={petOptions}
        value={data.pets}
        onChange={(v) => onChange({ pets: v })}
      />
      <MultiOptionPicker
        label="Hobbies & interests"
        options={hobbyOptions}
        value={data.hobbies}
        max={10}
        onChange={(v) => onChange({ hobbies: v })}
      />
    </View>
  );
}
