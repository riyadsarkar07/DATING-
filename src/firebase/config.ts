import Constants from 'expo-constants';

const getEnv = (key: string, fallback = ''): string => {
  const value = process.env[key] ?? Constants.expoConfig?.extra?.[key];
  return value || fallback;
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
