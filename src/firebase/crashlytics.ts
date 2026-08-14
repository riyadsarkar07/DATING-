import crashlytics from '@react-native-firebase/crashlytics';

export async function bootstrapCrashlytics(): Promise<void> {
  try {
    await crashlytics().setCrashlyticsCollectionEnabled(true);
  } catch {
    // requires a native dev build
  }
}

export function log(message: string): void {
  try {
    crashlytics().log(message);
  } catch {
    // no-op
  }
}

export function recordError(error: unknown, context?: string): void {
  try {
    crashlytics().recordError(error as Error);
    if (context) crashlytics().log(context);
  } catch {
    // no-op
  }
}

export async function setUid(uid: string | null): Promise<void> {
  try {
    if (uid) {
      await crashlytics().setUserId(uid);
    } else {
      await crashlytics().setUserId('');
    }
  } catch {
    // no-op
  }
}

export async function setAttribute(key: string, value: string): Promise<void> {
  try {
    await crashlytics().setAttribute(key, value);
  } catch {
    // no-op
  }
}
