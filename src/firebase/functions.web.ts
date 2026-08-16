import firebase from './initialize.web';

export async function callFunction<T = unknown>(
  name: string,
  data?: Record<string, unknown>,
): Promise<T> {
  const fn = firebase.functions().httpsCallable(name);
  const res = await fn(data ?? {});
  return res.data as T;
}
