import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import FastImage from 'react-native-fast-image';
import { AppText } from '../../components/ui/AppText';
import { WizardHeader } from './fields';
import { useMediaPicker } from '../../hooks/useMediaPicker';
import { profileService } from '../../services/profile.service';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { colors, radius } from '../../constants/theme';

interface PhotosStepProps {
  step: number;
  total: number;
  photos: string[];
  videoIntro: string | null;
  onChange: (photos: string[]) => void;
  onVideoChange: (url: string | null) => void;
}

const MAX_PHOTOS = 6;

export function PhotosStep({ step, total, photos, videoIntro, onChange, onVideoChange }: PhotosStepProps) {
  const { pickImage, takePhoto, pickVideo, picking } = useMediaPicker();
  const uid = useAuthStore((s) => s.uid);
  const showToast = useAppStore((s) => s.showToast);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);

  const addPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    setUploading(true);
    try {
      const asset = await pickImage();
      if (!asset || !uid) return;
      showToast('Uploading photo...', 'info');
      const { url } = await profileService.uploadPhoto(uid, asset.uri);
      onChange([...photos, url]);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const capturePhoto = async () => {
    if (photos.length >= MAX_PHOTOS) return;
    setUploading(true);
    try {
      const asset = await takePhoto();
      if (!asset || !uid) return;
      showToast('Uploading photo...', 'info');
      const { url } = await profileService.uploadPhoto(uid, asset.uri);
      onChange([...photos, url]);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const addVideo = async () => {
    setVideoUploading(true);
    try {
      const asset = await pickVideo();
      if (!asset || !uid) return;
      showToast('Uploading video intro...', 'info');
      const { url } = await profileService.uploadVideo(uid, asset.uri);
      onVideoChange(url);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setVideoUploading(false);
    }
  };

  const removePhoto = (url: string) => {
    onChange(photos.filter((p) => p !== url));
  };

  return (
    <View>
      <WizardHeader
        step={step}
        total={total}
        title="Add your photos"
        subtitle="Show off who you are. Profiles with at least 2 photos get 10x more likes."
        progress={(step / total) * 100}
      />

      <View style={styles.grid}>
        {photos.map((url) => (
          <Pressable key={url} style={styles.cell} onPress={() => removePhoto(url)}>
            <FastImage source={{ uri: url }} style={styles.image} resizeMode={FastImage.resizeMode.cover} />
            <View style={styles.removeBadge}>
              <Ionicons name="close" size={14} color={colors.white} />
            </View>
          </Pressable>
        ))}
        {photos.length < MAX_PHOTOS ? (
          <>
            <Pressable style={styles.addCell} onPress={addPhoto} disabled={uploading || picking}>
              {uploading || picking ? (
                <ActivityIndicator color={colors.violet[400]} />
              ) : (
                <>
                  <Ionicons name="image-outline" size={26} color={colors.violet[400]} />
                  <AppText variant="caption" color={colors.violet[400]}>
                    Library
                  </AppText>
                </>
              )}
            </Pressable>
            <Pressable style={styles.addCell} onPress={capturePhoto} disabled={uploading || picking}>
              {uploading || picking ? (
                <ActivityIndicator color={colors.blush[500]} />
              ) : (
                <>
                  <Ionicons name="camera-outline" size={26} color={colors.blush[500]} />
                  <AppText variant="caption" color={colors.blush[500]}>
                    Camera
                  </AppText>
                </>
              )}
            </Pressable>
          </>
        ) : null}
      </View>

      <View style={styles.videoSection}>
        <AppText variant="subheading">Video intro</AppText>
        <AppText variant="caption" color={colors.textTertiary} style={{ marginBottom: 12 }}>
          A short video makes your profile stand out. Optional but highly recommended.
        </AppText>
        {videoIntro ? (
          <View style={styles.videoDone}>
            <Ionicons name="videocam" size={22} color={colors.green} />
            <AppText variant="label" color={colors.green} style={{ flex: 1 }}>
              Video intro uploaded
            </AppText>
            <Pressable onPress={() => onVideoChange(null)} hitSlop={10}>
              <Ionicons name="trash-outline" size={20} color={colors.red} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.videoButton} onPress={addVideo} disabled={videoUploading}>
            {videoUploading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="videocam-outline" size={20} color={colors.white} />
                <AppText variant="label">Add video intro</AppText>
              </>
            )}
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cell: {
    width: 102,
    height: 102,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCell: {
    width: 102,
    height: 102,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.borderGlass,
    backgroundColor: colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  videoSection: {
    marginTop: 28,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: colors.violet[600],
  },
  videoDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: radius.md,
    backgroundColor: 'rgba(61,220,151,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(61,220,151,0.3)',
  },
});
