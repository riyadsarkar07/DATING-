import React, { useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS } from 'react-native-reanimated';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { useAuthStore } from '../../store/auth.store';
import { usePremiumStore } from '../../store/premium.store';
import { coinService } from '../../services/coin.service';
import { luckySpinPrizes } from '../../constants/premium';
import { colors, radius } from '../../constants/theme';

export function LuckySpinScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const coins = usePremiumStore((s) => s.coins);
  const rotation = useSharedValue(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{ id: string; label: string; coins: number } | null>(null);

  const SPIN_COST = 10;

  const spin = async () => {
    if (!uid || spinning) return;
    if (coins.balance < SPIN_COST) {
      navigation.navigate('Coins');
      return;
    }
    setSpinning(true);
    setResult(null);
    try {
      const res = await coinService.spinWheel();
      if (!res.ok || !res.prize) {
        setSpinning(false);
        navigation.navigate('Coins');
        return;
      }
      const prize = res.prize;
      const idx = Math.max(0, luckySpinPrizes.findIndex((p) => p.id === prize.id));
      const target = 360 * 5 + idx * 60 + 30;
      rotation.value = 0;
      rotation.value = withTiming(rotation.value + target, { duration: 3000 }, (finished) => {
        if (finished) {
          runOnJS(onSpinDone)(prize);
        }
      });
    } catch {
      setSpinning(false);
    }
  };

  const onSpinDone = (prize: { id: string; label: string; coins: number }) => {
    setResult(prize);
    setSpinning(false);
  };

  const needleStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Screen headerTitle="Lucky Spin" onBack={navigation.goBack}>
      <View style={styles.header}>
        <AppText variant="heading" style={{ color: '#FFC107' }}>
          Spin &amp; win coins
        </AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          10 coins per spin · balance: {coins.balance}
        </AppText>
      </View>

      <View style={styles.wheelWrap}>
        <View style={styles.needle} />
        <Animated.View style={[styles.wheel, needleStyle]}>
          {luckySpinPrizes.map((p, i) => (
            <View
              key={p.id}
              style={[
                styles.segment,
                {
                  backgroundColor: p.color,
                  transform: [{ rotate: `${(360 / luckySpinPrizes.length) * i}deg` }, { translateY: -80 }],
                },
              ]}
            >
              <AppText variant="caption" style={styles.segmentText}>{p.label}</AppText>
            </View>
          ))}
        </Animated.View>
      </View>

      {result ? (
        <View style={styles.resultCard}>
          <Ionicons name="trophy" size={22} color="#FFC107" />
          <AppText variant="label" style={{ color: '#FFC107' }}>
            You won {result.label}!
          </AppText>
        </View>
      ) : null}

      <Pressable disabled={spinning} onPress={spin} style={[styles.spinBtn, spinning && { opacity: 0.5 }]}>
        <Ionicons name="refresh" size={22} color={colors.white} />
        <AppText variant="label" color={colors.white}>{spinning ? 'Spinning...' : 'Spin (10 coins)'}</AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', gap: 6, paddingVertical: 20 },
  wheelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  wheel: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: colors.ink[800],
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.borderGlass,
  },
  segment: {
    position: 'absolute',
    top: 110,
    left: 110,
    width: 14,
    height: 90,
    borderRadius: 7,
    alignItems: 'center',
  },
  segmentText: {
    color: colors.white,
    fontSize: 8,
    lineHeight: 10,
  },
  needle: {
    position: 'absolute',
    top: 20,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderTopWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFC107',
    zIndex: 10,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  spinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.violet[600],
    borderRadius: radius.full,
    paddingVertical: 16,
    marginTop: 8,
  },
});
