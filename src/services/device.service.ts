import { getCurrentUser } from '../firebase/auth';
import { userService } from './user.service';

export async function onTokenRefreshed(token: string): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;
  await userService.updateFcmToken(user.uid, token);
}

export async function reportOnline(): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;
  await userService.setOnline(user.uid, true);
}

export async function reportOffline(): Promise<void> {
  const user = getCurrentUser();
  if (!user) return;
  await userService.setOnline(user.uid, false);
}
