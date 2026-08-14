import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useAppStore } from '../store/app.store';
import { navigationRef } from './RootNavigationRef';

export function AuthRedirect() {
  const status = useAuthStore((s) => s.status);
  const onboardingDone = useAppStore((s) => s.onboardingDone);
  const hydrationDone = useAppStore((s) => s.hydrationDone);
  const bootstrapped = useRef(false);
  const last = useRef<string | null>(null);

  useEffect(() => {
    // Wait for the auth listener + onboarding hydration before routing.
    if (!hydrationDone || status === 'unknown') return;
    if (!navigationRef.isReady()) return;

    const key = `${status}|${onboardingDone}`;
    if (key === last.current) return;

    // The SplashScreen performs the very first navigation with its branding delay.
    // Skip that initial resolution here to avoid racing it.
    if (!bootstrapped.current) {
      bootstrapped.current = true;
      last.current = key;
      return;
    }
    last.current = key;

    const route = !onboardingDone
      ? 'Onboarding'
      : status === 'unauthenticated'
        ? 'Auth'
        : status === 'incomplete-profile'
          ? 'ProfileSetup'
          : 'Main';

    navigationRef.reset({
      index: 0,
      routes: [{ name: route as never }],
    });
  }, [status, onboardingDone, hydrationDone]);

  return null;
}
