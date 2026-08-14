import analytics from '@react-native-firebase/analytics';
import { store } from '../store';

export async function bootstrapAnalytics(): Promise<void> {
  try {
    await analytics().setAnalyticsCollectionEnabled(true);
  } catch {
    // analytics requires a native dev build
  }
}

export async function logEvent(event: string, params?: Record<string, unknown>): Promise<void> {
  try {
    await analytics().logEvent(event, params as any);
  } catch {
    // no-op when unavailable
  }
}

export async function setUserId(uid: string | null): Promise<void> {
  try {
    await analytics().setUserId(uid);
  } catch {
    // no-op
  }
}

export async function setUserProperties(props: Record<string, string>): Promise<void> {
  try {
    await analytics().setUserProperties(props as any);
  } catch {
    // no-op
  }
}

export function trackScreen(name: string): void {
  const currentUid = store.getState().auth.uid;
  logEvent('screen_view', { screen_name: name, user_id: currentUid ?? undefined });
}
