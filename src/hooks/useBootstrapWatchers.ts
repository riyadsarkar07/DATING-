import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useAppStore } from '../store/app.store';
import { useChatStore } from '../store/chat.store';
import { useNotificationStore } from '../store/notification.store';
import { usePremiumStore } from '../store/premium.store';
import { useSettingsStore } from '../store/settings.store';
import { userService } from '../services/user.service';
import { matchService } from '../services/match.service';
import { notificationService } from '../services/notification.service';
import { premiumService } from '../services/premium.service';
import { coinService } from '../services/coin.service';
import { callService } from '../services/call.service';
import { settingsService } from '../services/settings.service';
import { detectAndSetLocation } from '../services/location.service';
import { navigate } from '../navigation/RootNavigationRef';

export function useBootstrapWatchers() {
  const uid = useAuthStore((s) => s.uid);
  const status = useAuthStore((s) => s.status);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setBootstrapped = useAppStore((s) => s.setBootstrapped);
  const setMatches = useChatStore((s) => s.setMatches);
  const setUid = useNotificationStore((s) => s.setUid);
  const setItems = useNotificationStore((s) => s.setItems);
  const setPremium = usePremiumStore((s) => s.setPremium);
  const setCoins = usePremiumStore((s) => s.setCoins);
  const setBoost = usePremiumStore((s) => s.setBoost);
  const setSettings = useSettingsStore((s) => s.setSettings);

  useEffect(() => {
    if (!uid || status !== 'authenticated') return;

    const unsubs: (() => void)[] = [];

    userService
      .watchOwnProfile(uid, (profile) => {
        if (profile) setProfile(profile);
      })
      .then((unsub) => unsubs.push(unsub))
      .catch(() => {});

    unsubs.push(matchService.watchMatches(uid, setMatches));
    unsubs.push(notificationService.watchNotifications(uid, setItems));
    unsubs.push(premiumService.watchState(uid, setPremium));
    unsubs.push(premiumService.watchBoost(uid, setBoost));
    unsubs.push(coinService.watchBalance(uid, setCoins));
    settingsService
      .watch(uid, setSettings)
      .then((unsub) => unsubs.push(unsub))
      .catch(() => {});
    setUid(uid);

    detectAndSetLocation()
      .then((point) => {
        if (point) {
          userService.updateLocation(uid, point).catch(() => {});
        }
      })
      .catch(() => {});

    unsubs.push(
      callService.watchIncoming(uid, (signal) => {
        if (!signal) return;
        const peer = { uid: signal.callerId, displayName: 'SparkX Call', photos: [] };
        navigate(signal.type === 'video' ? 'VideoCall' : 'VoiceCall', {
          matchId: signal.matchId,
          peer: peer as any,
          signalId: signal.id,
          direction: 'incoming',
        });
      }),
    );

    setBootstrapped(true);

    return () => {
      unsubs.forEach((fn) => fn());
      setUid(null);
      setBootstrapped(false);
    };
  }, [uid, status, setProfile, setMatches, setUid, setItems, setPremium, setCoins, setBoost, setSettings, setBootstrapped]);
}
