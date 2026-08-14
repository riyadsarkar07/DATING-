export async function bootstrapCrashlytics(): Promise<void> {
  // Crashlytics is a native-only service; no-op on web.
}

export function log(message: string): void {
  // no-op on web
}

export function recordError(error: unknown, context?: string): void {
  // no-op on web
}

export async function setUid(uid: string | null): Promise<void> {
  // no-op on web
}

export async function setAttribute(key: string, value: string): Promise<void> {
  // no-op on web
}
