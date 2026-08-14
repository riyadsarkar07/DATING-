import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { useAuthStore } from '../../store/auth.store';
import { usePremiumStore } from '../../store/premium.store';
import { premiumService } from '../../services/premium.service';
import { premiumPlans } from '../../constants/premium';
import { colors, radius, shadows } from '../../constants/theme';

const TIER_LABEL: Record<string, string> = {
  gold: 'Gold',
  platinum: 'Platinum',
  diamond: 'Diamond',
};

export function PremiumScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const premium = usePremiumStore((s) => s.premium);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (uid) premiumService.watchState(uid, usePremiumStore.getState().setPremium);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const buy = async (planId: string) => {
    if (!uid) return;
    const plan = premiumPlans.find((p) => p.id === planId);
    if (!plan) return;
    setBusyId(planId);
    setError(null);
    try {
      await premiumService.purchase(uid, plan.tier, plan.periodMonths, plan.price);
      usePremiumStore.getState().setPremium(await premiumService.getState(uid));
    } catch (e) {
      setError('Purchase could not be completed. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Screen headerTitle="SparkX Premium" onBack={navigation.goBack} scroll>
      {premium.tier ? (
        <GlassCard style={styles.activeCard}>
          <Ionicons name="trophy" size={30} color="#FFC107" />
          <View style={{ flex: 1 }}>
            <AppText variant="label">{TIER_LABEL[premium.tier]} active</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              {premium.expiresAt ? `Renews on ${new Date(premium.expiresAt).toLocaleDateString()}` : 'Active'}
            </AppText>
          </View>
        </GlassCard>
      ) : null}

      {premiumPlans.map((plan) => {
        const active = premium.tier === plan.tier;
        return (
          <LinearGradient
            key={plan.id}
            colors={['rgba(18,18,32,0.9)', 'rgba(10,10,20,0.95)']}
            style={styles.plan}
          >
            <View style={styles.planTop}>
              <View style={{ flex: 1 }}>
                <AppText variant="subheading">{plan.title}</AppText>
                <AppText variant="caption" color={colors.textSecondary}>
                  {plan.subtitle}
                </AppText>
              </View>
              {plan.badge ? (
                <View style={[styles.badge, { backgroundColor: plan.accent[1] }]}>
                  <AppText variant="caption" style={styles.badgeText}>
                    {plan.badge}
                  </AppText>
                </View>
              ) : null}
            </View>

            <View style={styles.priceRow}>
              <AppText variant="heading" style={{ color: plan.accent[0] }}>
                ${plan.price}
              </AppText>
              <AppText variant="caption" color={colors.textTertiary} style={styles.oldPrice}>
                ${plan.oldPrice}
              </AppText>
            </View>

            {plan.features.map((f) => (
              <View key={f} style={styles.feature}>
                <Ionicons name="checkmark-circle" size={16} color={colors.green} />
                <AppText variant="caption" color={colors.textSecondary}>
                  {f}
                </AppText>
              </View>
            ))}

            <GradientButton
              title={active ? 'Current plan' : `Choose ${plan.title}`}
              variant={active ? 'ghost' : 'premium'}
              disabled={active || busyId !== null}
              loading={busyId === plan.id}
              onPress={() => buy(plan.id)}
            />
          </LinearGradient>
        );
      })}

      {error ? (
        <AppText variant="caption" color={colors.red} style={{ textAlign: 'center', marginTop: 8 }}>
          {error}
        </AppText>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  activeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  plan: {
    borderRadius: radius.xl,
    padding: 20,
    gap: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    ...shadows.soft,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: colors.white,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  oldPrice: {
    textDecorationLine: 'line-through',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
