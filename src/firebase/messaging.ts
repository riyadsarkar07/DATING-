import messaging from '@react-native-firebase/messaging';
import { notificationService } from '../services/notification.service';
import { store } from '../store';
import { onTokenRefreshed } from '../services/device.service';

export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const status = await messaging().requestPermission();
    return status === messaging.AuthorizationStatus.AUTHORIZED || status === messaging.AuthorizationStatus.PROVISIONAL;
  } catch {
    return false;
  }
}

export async function getFcmToken(): Promise<string | null> {
  try {
    return await messaging().getToken();
  } catch {
    return null;
  }
}

export async function bootstrapMessaging(): Promise<void> {
  messaging().onTokenRefresh((token) => {
    onTokenRefreshed(token);
  });

  messaging().onMessage(async (remoteMessage) => {
    notificationService.onMessageReceived(remoteMessage);
  });

  const enabled = await requestNotificationPermission();
  if (enabled) {
    const token = await getFcmToken();
    if (token) await onTokenRefreshed(token);
  }
}
