import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { GradientButton } from '../../components/ui/GradientButton';
import { useAuthStore } from '../../store/auth.store';
import { usePremiumStore } from '../../store/premium.store';
import { coinService } from '../../services/coin.service';
import { dailyRewardStreaks } from '../../constants/premium';
import { colors } from '../../constants/theme';

export function DailyRewardScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const daily = usePremiumStore((s) => s.daily);
  const coins = usePremiumStore((s) => s.coins);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState<number | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = coinService.watchBalance(uid, usePremiumStore.getState().setCoins);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const todayStreak = daily.streak || coins.streak || 0;
  const todayClaimed = daily.lastClaimAt ? isToday(daily.lastClaimAt) : false;

  const claim = async () => {
    if (!uid || todayClaimed) return;
    setClaiming(true);
    try {
      const res = await coinService.claimDailyReward(uid);
      if (!res.alreadyClaimed) setClaimed(res.coins);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <Screen headerTitle="Daily Reward" onBack={navigation.goBack}>
      <View style={styles.header}>
        <Ionicons name="calendar" size={48} color="#FFC107" />
        <AppText variant="heading" style={{ color: '#FFC107' }}>
          {claimed ?? 'Claim daily coins'}
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {todayClaimed
            ? 'Come back tomorrow for your next reward.'
            : `Day ${todayStreak + 1} of 7 · streak ${todayStreak}`}
        </AppText>
      </View>

      <View style={styles.streak}>
        {dailyRewardStreaks.map((day) => {
          const done = day.day <= todayStreak;
          const current = day.day === todayStreak + 1;
          return (
            <View key={day.day} style={styles.day}>
              <View
                style={[
                  styles.dayCircle,
                  done && { backgroundColor: 'rgba(255,193,7,0.25)', borderColor: '#FFC107' },
                  current && { backgroundColor: '#FFC107' },
                ]}
              >
                {done ? (
                  <Ionicons name="checkmark" size={16} color={colors.white} />
                ) : (
                  <AppText variant="caption" color={current ? colors.ink[950] : colors.textSecondary}>
                    {day.coins}
                  </AppText>
                )}
              </View>
              <AppText variant="caption" color={colors.textSecondary}>Day {day.day}</AppText>
            </View>
          );
        })}
      </View>

      <GradientButton
        title={todayClaimed ? 'Claimed today' : `Claim ${dailyRewardStreaks[(todayStreak) % 7].coins} coins`}
        variant="gold"
        disabled={todayClaimed || claiming}
        loading={claiming}
        onPress={claim}
      />
    </Screen>
  );
}

function isToday(ms: number): boolean {
  const d = new Date(ms);
  const n = new Date();
  return d.getDate() === n.getDate() && d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear();
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 24,
  },
  streak: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 24,
  },
  day: {
    alignItems: 'center',
    gap: 6,
  },
  dayCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceGlass,
  },
});
