import React from 'react';
import { View } from 'react-native';
import { AppInput } from '../../components/ui/AppInput';
import { WizardHeader } from './fields';

interface SocialStepProps {
  step: number;
  total: number;
  data: {
    instagram: string;
    spotify: string;
  };
  onChange: (patch: Partial<SocialStepProps['data']>) => void;
}

export function SocialStep({ step, total, data, onChange }: SocialStepProps) {
  return (
    <View>
      <WizardHeader
        step={step}
        total={total}
        title="Connect your socials"
        subtitle="Adding your Instagram and Spotify helps others get a fuller picture of you."
        progress={(step / total) * 100}
      />

      <AppInput
        label="Instagram"
        placeholder="@yourhandle"
        value={data.instagram}
        onChangeText={(t) => onChange({ instagram: t })}
        icon="logo-instagram"
        autoCapitalize="none"
      />
      <AppInput
        label="Spotify"
        placeholder="Spotify username or profile link"
        value={data.spotify}
        onChangeText={(t) => onChange({ spotify: t })}
        icon="musical-notes-outline"
        autoCapitalize="none"
      />
    </View>
  );
}
