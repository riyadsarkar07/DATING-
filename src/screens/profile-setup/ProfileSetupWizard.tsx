import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getCurrentUser } from '../../firebase/auth';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { GradientButton } from '../../components/ui/GradientButton';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { AppText } from '../../components/ui/AppText';
import { EmailVerificationScreen } from '../auth/EmailVerificationScreen';
import { PhotosStep } from './PhotosStep';
import { BasicInfoStep } from './BasicInfoStep';
import { AboutStep } from './AboutStep';
import { LifestyleStep } from './LifestyleStep';
import { SocialStep } from './SocialStep';
import { Gender, InterestedIn, Education, RelationshipGoal, Smoking, Drinking, UserProfile } from '../../types';
import { GeoPoint } from '../../types/user';
import { parseDob, ageFromDob } from '../../core/utils/date';
import { detectAndSetLocation } from '../../services/location.service';
import { isValidDateOfBirth, isValidName } from '../../core/utils/validation';
import { colors, layout } from '../../constants/theme';

interface WizardData {
  displayName: string;
  photos: string[];
  videoIntro: string | null;
  dob: string;
  gender: Gender | '';
  interestedIn: InterestedIn | '';
  country: string;
  city: string;
  bio: string;
  height: string;
  religion: string;
  education: Education | '';
  occupation: string;
  languages: string[];
  relationshipGoal: RelationshipGoal | '';
  smoking: string;
  drinking: string;
  pets: string[];
  hobbies: string[];
  instagram: string;
  spotify: string;
  location: GeoPoint | null;
}

const TOTAL_STEPS = 5;

export function ProfileSetupWizard() {
  const profile = useAuthStore((s) => s.profile);
  const uid = useAuthStore((s) => s.uid);
  const completeProfile = useAuthStore((s) => s.completeProfile);
  const showToast = useAppStore((s) => s.showToast);

  const [step, setStep] = useState(0);
  const [data, setData] = useState<WizardData>(() => ({
    displayName: profile?.displayName ?? '',
    photos: profile?.photos ?? [],
    videoIntro: profile?.videoIntro ?? null,
    dob: '',
    gender: profile?.gender ?? '',
    interestedIn: profile?.interestedIn ?? '',
    country: profile?.country ?? '',
    city: profile?.city ?? '',
    bio: profile?.bio ?? '',
    height: profile?.height ? `${profile.height}` : '',
    religion: profile?.religion ?? '',
    education: profile?.education ?? '',
    occupation: profile?.occupation ?? '',
    languages: profile?.languages ?? [],
    relationshipGoal: profile?.relationshipGoal ?? '',
    smoking: profile?.smoking ?? '',
    drinking: profile?.drinking ?? '',
    pets: profile?.pets ?? [],
    hobbies: profile?.hobbies ?? [],
    instagram: profile?.instagram ?? '',
    spotify: profile?.spotify ?? '',
    location: profile?.location ?? null,
  }));
  const [saving, setSaving] = useState(false);

  const emailVerified = getCurrentUser()?.emailVerified ?? true;

  if (!emailVerified) {
    return <EmailVerificationScreen />;
  }

  const patch = (p: Partial<WizardData>) => setData((d) => ({ ...d, ...p }));

  const validateStep = (): string => {
    switch (step) {
      case 0:
        return data.photos.length >= 1 ? '' : 'Add at least one photo to continue.';
      case 1:
        if (!isValidName(data.displayName)) return 'Please enter your name.';
        if (!data.dob) return 'Please enter your date of birth.';
        if (!isValidDateOfBirth(parseDob(data.dob) ?? 0)) return 'You must be 18 or older.';
        if (!data.gender) return 'Please select your gender.';
        if (!data.interestedIn) return 'Please select who you are interested in.';
        return '';
      default:
        return '';
    }
  };

  const next = () => {
    const error = validateStep();
    if (error) {
      showToast(error, 'error');
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS - 1, s + 1));
  };

  const finish = async () => {
    if (!uid) return;
    setSaving(true);
    try {
      const dobMs = parseDob(data.dob);
      if (!dobMs || !isValidDateOfBirth(dobMs)) {
        showToast('Please set a valid date of birth.', 'error');
        return;
      }
      let location = data.location;
      if (!location) {
        location = await detectAndSetLocation();
      }
      const finalProfile: UserProfile = {
        ...(profile as UserProfile),
        uid,
        email: profile?.email ?? getCurrentUser()?.email ?? '',
        phone: profile?.phone ?? getCurrentUser()?.phoneNumber ?? null,
        displayName: data.displayName.trim(),
        photos: data.photos,
        videoIntro: data.videoIntro,
        dob: dobMs,
        age: ageFromDob(dobMs),
        gender: data.gender as Gender,
        interestedIn: data.interestedIn as InterestedIn,
        country: data.country,
        city: data.city,
        bio: data.bio,
        height: data.height ? Number(data.height) : null,
        religion: data.religion,
        education: data.education as Education,
        occupation: data.occupation,
        languages: data.languages,
        relationshipGoal: data.relationshipGoal as RelationshipGoal,
        smoking: (data.smoking || '') as Smoking,
        drinking: (data.drinking || '') as Drinking,
        pets: data.pets,
        hobbies: data.hobbies,
        instagram: data.instagram,
        spotify: data.spotify,
        location,
        setupComplete: true,
      };
      await completeProfile(finalProfile);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.topBar}>
          <AppText variant="subheading" style={styles.logo}>
            Spark<AppText variant="subheading" color={colors.blush[500]}>X</AppText>
          </AppText>
          <AppText variant="caption" color={colors.textTertiary}>
            {Math.round(progress)}% complete
          </AppText>
        </View>
        <View style={styles.progressWrap}>
          <ProgressBar progress={progress} />
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {step === 0 ? (
            <PhotosStep
              step={1}
              total={TOTAL_STEPS}
              photos={data.photos}
              videoIntro={data.videoIntro}
              onChange={(photos) => patch({ photos })}
              onVideoChange={(url) => patch({ videoIntro: url })}
            />
          ) : step === 1 ? (
            <BasicInfoStep step={2} total={TOTAL_STEPS} data={data} onChange={patch} />
          ) : step === 2 ? (
            <AboutStep step={3} total={TOTAL_STEPS} data={data} onChange={patch} />
          ) : step === 3 ? (
            <LifestyleStep step={4} total={TOTAL_STEPS} data={data} onChange={patch} />
          ) : (
            <SocialStep step={5} total={TOTAL_STEPS} data={data} onChange={patch} />
          )}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            {step > 0 ? (
              <GradientButton
                title="Back"
                variant="outline"
                onPress={() => setStep((s) => Math.max(0, s - 1))}
                style={styles.footerBtn}
                compact
              />
            ) : null}
            <GradientButton
              title={step === TOTAL_STEPS - 1 ? 'Finish' : 'Continue'}
              onPress={step === TOTAL_STEPS - 1 ? finish : next}
              loading={saving}
              style={styles.footerBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 8,
    marginBottom: 12,
  },
  logo: {
    letterSpacing: 1,
  },
  progressWrap: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 24,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: 12,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  footerBtn: {
    flex: 1,
  },
});
