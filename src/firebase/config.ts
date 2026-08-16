import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

const staticEnv: Record<string, string | undefined> = {
  EXPO_PUBLIC_FIREBASE_PROJECT_ID: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  EXPO_PUBLIC_FIREBASE_API_KEY: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  EXPO_PUBLIC_FIREBASE_APP_ID: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  EXPO_PUBLIC_SCHEME: process.env.EXPO_PUBLIC_SCHEME,
};

const getEnv = (key: string, fallback = ''): string => {
  const value = staticEnv[key] ?? (extra as Record<string, unknown>)[key];
  return typeof value === 'string' && value ? value : fallback;
};

export const firebaseConfig = {
  projectId: getEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID', 'sparkx-app'),
  apiKey: getEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  storageBucket: getEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

export const googleConfig = {
  webClientId: getEnv('EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID'),
};

export const appConfig = {
  scheme: getEnv('EXPO_PUBLIC_SCHEME', 'sparkx'),
};
