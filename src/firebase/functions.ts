import functions from '@react-native-firebase/functions';

/**
 * Invoke a Cloud Function callable. Privileged mutations (coins, premium,
 * boosts, swipes/matches, block/unblock, account deletion) are enforced
 * server-side.
 */
export async function callFunction<T = unknown>(
  name: string,
  data?: Record<string, unknown>,
): Promise<T> {
  const fn = functions().httpsCallable<Record<string, unknown>, T>(name);
  const res = await fn(data ?? {});
  return res.data as T;
}
