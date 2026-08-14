import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { AppInput } from '../../components/ui/AppInput';
import { Chip } from '../../components/ui/Chip';
import { GradientButton } from '../../components/ui/GradientButton';
import { AppModal } from '../../components/ui/AppModal';
import { SafeImage } from '../../components/common/SafeImage';
import { useAuthStore } from '../../store/auth.store';
import { profileService } from '../../services/profile.service';
import { useMediaPicker } from '../../hooks/useMediaPicker';
import { useAppStore } from '../../store/app.store';
import { genderOptions, relationshipGoalOptions, heightOptions, languagesOptions, hobbyOptions, religionOptions, educationOptions, smokingOptions, drinkingOptions } from '../../constants/options';
import { colors, layout, radius } from '../../constants/theme';

export function EditProfileScreen({ navigation }: any) {
  const profile = useAuthStore((s) => s.profile);
  const patchProfile = useAuthStore((s) => s.patchProfile);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const showToast = useAppStore((s) => s.showToast);
  const { pickImage, takePhoto, picking } = useMediaPicker();

  const [photos, setPhotos] = useState(profile?.photos ?? []);
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [occupation, setOccupation] = useState(profile?.occupation ?? '');
  const [height, setHeight] = useState(profile?.height ?? null);
  const [languages, setLanguages] = useState<string[]>(profile?.languages ?? []);
  const [hobbies, setHobbies] = useState<string[]>(profile?.hobbies ?? []);
  const [saving, setSaving] = useState(false);
  const [heightOpen, setHeightOpen] = useState(false);
  const [languagesOpen, setLanguagesOpen] = useState(false);
  const [hobbiesOpen, setHobbiesOpen] = useState(false);

  if (!profile) return null;

  const addPhoto = async (kind: 'library' | 'camera') => {
    if (photos.length >= 6) {
      showToast('Maximum of 6 photos', 'error');
      return;
    }
    const asset = kind === 'library' ? await pickImage() : await takePhoto();
    if (!asset) return;
    try {
      const { url } = await profileService.uploadPhoto(profile.uid, asset.uri);
      const next = [...photos, url];
      setPhotos(next);
      await profileService.updateProfile(profile.uid, { photos: next });
    } catch {
      showToast('Upload failed', 'error');
    }
  };

  const removePhoto = async (index: number) => {
    const url = photos[index];
    const next = photos.filter((_, i) => i !== index);
    setPhotos(next);
    await profileService.updateProfile(profile.uid, { photos: next }).catch(() => {});
    profileService.removePhoto(profile.uid, url, next).catch(() => {});
  };

  const toggle = (list: string[], set: (v: string[]) => void, value: string) => {
    set(list.includes(value) ? list.filter((x) => x !== value) : [...list, value]);
  };

  const save = async () => {
    setSaving(true);
    try {
      patchProfile({
        bio,
        occupation,
        height,
        languages,
        hobbies,
      });
      await profileService.updateProfile(profile.uid, { bio, occupation, height, languages, hobbies });
      await refreshProfile();
      showToast('Profile updated', 'success');
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen headerTitle="Edit Profile" onBack={navigation.goBack} scroll keyboardAvoid>
      <View style={styles.section}>
        <AppText variant="subheading">Photos</AppText>
        <View style={styles.photoGrid}>
          {photos.map((url, i) => (
            <View key={i} style={styles.photoCell}>
              <SafeImage uri={url} style={styles.photo} />
              <Pressable onPress={() => removePhoto(i)} style={styles.photoRemove} hitSlop={8}>
                <Ionicons name="close" size={16} color={colors.white} />
              </Pressable>
            </View>
          ))}
          {photos.length < 6 ? (
            <Pressable style={styles.photoAdd} onPress={() => addPhoto('library')} disabled={picking}>
              <Ionicons name="image-outline" size={26} color={colors.textSecondary} />
            </Pressable>
          ) : null}
          {photos.length < 6 ? (
            <Pressable style={styles.photoAdd} onPress={() => addPhoto('camera')} disabled={picking}>
              <Ionicons name="camera-outline" size={26} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="subheading">About you</AppText>
        <TextInput
          value={bio}
          onChangeText={setBio}
          multiline
          maxLength={500}
          placeholder="Write something about yourself..."
          placeholderTextColor={colors.textTertiary}
          style={styles.textArea}
        />
        <AppInput label="Occupation" value={occupation} onChangeText={setOccupation} placeholder="e.g. Product Designer" />
      </View>

      <View style={styles.section}>
        <AppText variant="subheading">Height</AppText>
        <Pressable onPress={() => setHeightOpen(true)} style={styles.select}>
          <AppText color={height ? colors.white : colors.textTertiary}>
            {height ? `${(height / 100).toFixed(2).replace('.', "'")} ft` : 'Select height'}
          </AppText>
          <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.section}>
        <AppText variant="subheading">Languages</AppText>
        <View style={styles.chips}>
          <Pressable onPress={() => setLanguagesOpen(true)} style={styles.chipAdd}>
            <Ionicons name="add" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <AppText variant="subheading">Hobbies</AppText>
        <View style={styles.chips}>
          <Pressable onPress={() => setHobbiesOpen(true)} style={styles.chipAdd}>
            <Ionicons name="add" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <GradientButton title="Save Changes" onPress={save} loading={saving} />

      <AppModal visible={heightOpen} onClose={() => setHeightOpen(false)} heightRatio={0.55}>
        <ScrollView contentContainerStyle={styles.modalList}>
          {heightOptions.map((h) => (
            <Pressable key={h} onPress={() => { setHeight(h); setHeightOpen(false); }} style={styles.modalRow}>
              <AppText color={height === h ? colors.violet[400] : colors.white}>
                {(h / 100).toFixed(2).replace('.', "'")} ft
              </AppText>
            </Pressable>
          ))}
        </ScrollView>
      </AppModal>

      <AppModal visible={languagesOpen} onClose={() => setLanguagesOpen(false)} heightRatio={0.55}>
        <ScrollView contentContainerStyle={styles.modalList}>
          {languagesOptions.map((l) => (
            <Pressable key={l} onPress={() => toggle(languages, setLanguages, l)} style={styles.modalRow}>
              <AppText color={languages.includes(l) ? colors.violet[400] : colors.white}>{l}</AppText>
              {languages.includes(l) ? <Ionicons name="checkmark-circle" size={18} color={colors.violet[400]} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      </AppModal>

      <AppModal visible={hobbiesOpen} onClose={() => setHobbiesOpen(false)} heightRatio={0.55}>
        <ScrollView contentContainerStyle={styles.modalList}>
          {hobbyOptions.map((h) => (
            <Pressable key={h} onPress={() => toggle(hobbies, setHobbies, h)} style={styles.modalRow}>
              <AppText color={hobbies.includes(h) ? colors.violet[400] : colors.white}>{h}</AppText>
              {hobbies.includes(h) ? <Ionicons name="checkmark-circle" size={18} color={colors.violet[400]} /> : null}
            </Pressable>
          ))}
        </ScrollView>
      </AppModal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    marginBottom: 24,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photoCell: {
    width: 100,
    height: 130,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoRemove: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoAdd: {
    width: 100,
    height: 130,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
  },
  textArea: {
    minHeight: 110,
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    padding: 14,
    color: colors.white,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  select: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipAdd: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalList: {
    padding: 8,
    gap: 2,
  },
  modalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: radius.md,
  },
});
