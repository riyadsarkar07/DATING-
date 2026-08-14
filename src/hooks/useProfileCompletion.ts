import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { profileService } from '../services/profile.service';

export function useProfileCompletion(): number {
  const profile = useAuthStore((s) => s.profile);
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    let mounted = true;
    profileService.completionPercent(profile).then((value) => {
      if (mounted) setPercent(value);
    });
    return () => {
      mounted = false;
    };
  }, [profile]);

  return percent;
}
