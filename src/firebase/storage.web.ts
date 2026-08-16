import firebase from './initialize.web';

export const storageRef = () => firebase.storage();

function uriToBlob(uri: string, mimeType: string): Promise<Blob> {
  if (uri.startsWith('data:')) {
    const [header, base64] = uri.split(',');
    const mime = header.match(/data:(.*?)(;|$)/)?.[1] || mimeType;
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return Promise.resolve(new Blob([bytes], { type: mime }));
  }
  return fetch(uri).then((res) => res.blob());
}

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
  const blob = await uriToBlob(uri, mimeType);
  const task = storageRef().ref(path).put(blob, {
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
