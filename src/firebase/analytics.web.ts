import firebase from 'firebase/compat/app';
import 'firebase/compat/analytics';
import { store } from '../store';

export async function bootstrapAnalytics(): Promise<void> {
  try {
    await firebase.analytics();
  } catch {
    // analytics requires a measurementId configured for the web app
  }
}

export async function logEvent(event: string, params?: Record<string, unknown>): Promise<void> {
  try {
    await firebase.analytics().logEvent(event, params as any);
  } catch {
    // no-op when unavailable
  }
}

export async function setUserId(uid: string | null): Promise<void> {
  try {
    await firebase.analytics().setUserId(uid ?? '');
  } catch {
    // no-op
  }
}

export async function setUserProperties(props: Record<string, string>): Promise<void> {
  try {
    await firebase.analytics().setUserProperties(props as any);
  } catch {
    // no-op
  }
}

export function trackScreen(name: string): void {
  const currentUid = store.getState().auth.uid;
  logEvent('screen_view', { screen_name: name, user_id: currentUid ?? undefined });
}
