import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { useAuthStore } from '../../store/auth.store';
import { usePremiumStore } from '../../store/premium.store';
import { premiumService } from '../../services/premium.service';
import { boostPrices } from '../../constants/premium';
import { colors } from '../../constants/theme';

export function BoostScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const boost = usePremiumStore((s) => s.boost);
  const coins = usePremiumStore((s) => s.coins);
  const [busy, setBusy] = React.useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    const unsub = premiumService.watchBoost(uid, usePremiumStore.getState().setBoost);
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const activate = async (id: string, hours: number, cost: number) => {
    if (!uid) return;
    setBusy(id);
    try {
      const ok = await premiumService.activateBoost(uid, hours, cost);
      if (!ok) {
        navigation.navigate('Coins');
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <Screen headerTitle="Boost" onBack={navigation.goBack}>
      <View style={styles.header}>
        <Ionicons name="flash" size={44} color="#FFC107" />
        <AppText variant="heading" style={{ color: '#FFC107' }}>
          Get boosted
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          Boost puts your profile in front of more people. Balance: {coins.balance} coins.
        </AppText>
      </View>

      {boost.active ? (
        <GlassCard style={styles.active}>
          <Ionicons name="flash" size={20} color="#FFC107" />
          <AppText variant="label" color={colors.white}>
            Boost active{boost.expiresAt ? ` until ${new Date(boost.expiresAt).toLocaleTimeString()}` : ''}
          </AppText>
        </GlassCard>
      ) : null}

      <View style={styles.packs}>
        {boostPrices.map((b) => (
          <GlassCard key={b.id} style={styles.pack}>
            <AppText variant="subheading">{b.label}</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {b.coins} coins
            </AppText>
            <GradientButton
              title="Activate"
              variant="gold"
              loading={busy === b.id}
              disabled={busy !== null}
              onPress={() => activate(b.id, b.hours, b.coins)}
            />
          </GlassCard>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 8, paddingVertical: 20 },
  active: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  packs: {
    gap: 12,
  },
  pack: {
    gap: 8,
  },
});
