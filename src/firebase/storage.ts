import storage from '@react-native-firebase/storage';

export const storageRef = () => storage();

export function buildPath(uid: string, kind: 'photos' | 'videos' | 'voices', fileName: string) {
  const safe = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `users/${uid}/${kind}/${Date.now()}_${safe}`;
}

export async function uploadFile(
  path: string,
  uri: string,
  mimeType: string,
  onProgress?: (fraction: number) => void,
): Promise<string> {
  const task = storageRef().ref(path).putFile(uri, {
    contentType: mimeType,
  });
  if (onProgress) {
    task.on('state_changed', (snapshot) => {
      const fraction = snapshot.totalBytes > 0 ? snapshot.bytesTransferred / snapshot.totalBytes : 0;
      onProgress(fraction);
    });
  }
  await task;
  return storageRef().ref(path).getDownloadURL();
}

export async function uploadImage(uid: string, uri: string): Promise<string> {
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const path = buildPath(uid, 'photos', `photo.${ext}`);
  return uploadFile(path, uri, mime);
}

export async function uploadVideoIntro(uid: string, uri: string): Promise<string> {
  const path = buildPath(uid, 'videos', 'intro.mp4');
  return uploadFile(path, uri, 'video/mp4');
}

/**
 * Verification documents (selfie + government ID) are sensitive PII. They are
 * uploaded to a private, owner/admin-only path with a non-guessable filename,
 * never under users/{uid}/photos/* where any signed-in user could read them.
 */
export async function uploadVerificationFile(uid: string, uri: string, kind: 'selfie' | 'id'): Promise<string> {
  const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
  const random = `${Date.now()}_${Math.random().toString(36).slice(2, 12)}`;
  const path = `users/${uid}/private/verification/${kind}_${random}.${ext}`;
  return uploadFile(path, uri, mime);
}

export async function uploadVoiceMessage(uid: string, uri: string): Promise<string> {
  const path = buildPath(uid, 'voices', `voice_${Date.now()}.m4a`);
  return uploadFile(path, uri, 'audio/mp4');
}

export async function deleteFile(url: string): Promise<void> {
  try {
    await storageRef().refFromURL(url).delete();
  } catch {
    // best effort
  }
}
