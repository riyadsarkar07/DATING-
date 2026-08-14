export async function requestNotificationPermission(): Promise<boolean> {
  // FCM push notifications require a service worker + VAPID key on web; no-op here.
  return false;
}

export async function getFcmToken(): Promise<string | null> {
  // FCM web tokens require service-worker setup; no-op here.
  return null;
}

export async function bootstrapMessaging(): Promise<void> {
  // FCM push notifications are not configured for the web build.
  console.warn('Push notifications are only available in the mobile app.');
}
