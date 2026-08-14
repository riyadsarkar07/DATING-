import { useState } from 'react';
import { launchImageLibrary, launchCamera, Asset } from 'react-native-image-picker';
import { useAppStore } from '../store/app.store';

export interface PickedAsset {
  uri: string;
  width?: number;
  height?: number;
  durationMs?: number;
  type?: string;
}

function toAsset(asset: Asset | undefined): PickedAsset | null {
  if (!asset?.uri) return null;
  return {
    uri: asset.uri,
    width: asset.width,
    height: asset.height,
    durationMs: asset.duration,
    type: asset.type,
  };
}

export function useMediaPicker() {
  const showToast = useAppStore((s) => s.showToast);
  const [picking, setPicking] = useState(false);

  const pickImage = async (): Promise<PickedAsset | null> => {
    setPicking(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
        maxWidth: 1600,
        maxHeight: 2000,
      });
      if (result.didCancel || result.errorCode) return null;
      return toAsset(result.assets?.[0]);
    } catch (err) {
      showToast('Could not open the photo library', 'error');
      return null;
    } finally {
      setPicking(false);
    }
  };

  const takePhoto = async (): Promise<PickedAsset | null> => {
    setPicking(true);
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        maxWidth: 1600,
        maxHeight: 2000,
        saveToPhotos: false,
      });
      if (result.didCancel || result.errorCode) return null;
      return toAsset(result.assets?.[0]);
    } catch (err) {
      showToast('Camera is not available', 'error');
      return null;
    } finally {
      setPicking(false);
    }
  };

  const pickVideo = async (): Promise<PickedAsset | null> => {
    setPicking(true);
    try {
      const result = await launchImageLibrary({
        mediaType: 'video',
        selectionLimit: 1,
        quality: 0.8,
      });
      if (result.didCancel || result.errorCode) return null;
      return toAsset(result.assets?.[0]);
    } catch (err) {
      showToast('Could not open the video library', 'error');
      return null;
    } finally {
      setPicking(false);
    }
  };

  return { pickImage, takePhoto, pickVideo, picking };
}
