import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { GlassCard } from '../../components/ui/GlassCard';
import { GradientButton } from '../../components/ui/GradientButton';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/auth.store';
import { usePremiumStore } from '../../store/premium.store';
import { coinService } from '../../services/coin.service';
import { coinPacks } from '../../constants/premium';
import { CoinTransaction } from '../../types/premium';
import { colors, radius, shadows } from '../../constants/theme';
import { timeAgo } from '../../core/utils/date';

export function CoinsScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const coins = usePremiumStore((s) => s.coins);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;
    let unsub2: (() => void) | null = null;
    const unsub1 = coinService.watchBalance(uid, usePremiumStore.getState().setCoins);
    coinService.watchTransactions(uid, setTransactions).then((u) => {
      unsub2 = u;
    });
    return () => {
      unsub1();
      unsub2?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  const buy = async (packId: string) => {
    if (!uid) return;
    setBusy(packId);
    try {
      await coinService.buyPack(packId);
    } finally {
      setBusy(null);
    }
  };

  const renderTx = ({ item }: { item: CoinTransaction }) => (
    <View style={styles.txRow}>
      <View style={[styles.txIcon, { backgroundColor: item.type === 'earn' ? 'rgba(34,197,94,0.15)' : 'rgba(255,62,165,0.15)' }]}>
        <Ionicons name={item.type === 'earn' ? 'add' : 'remove'} size={16} color={item.type === 'earn' ? colors.green : '#FF3EA5'} />
      </View>
      <View style={{ flex: 1 }}>
        <AppText variant="body">{item.reason}</AppText>
        <AppText variant="caption" color={colors.textTertiary}>{timeAgo(item.createdAt)}</AppText>
      </View>
      <AppText variant="label" color={item.type === 'earn' ? colors.green : '#FF3EA5'}>
        {item.type === 'earn' ? '+' : '-'}{item.amount}
      </AppText>
    </View>
  );

  return (
    <Screen headerTitle="Coins" onBack={navigation.goBack}>
      <GlassCard style={styles.balance}>
        <Ionicons name="diamond" size={32} color="#FFC107" />
        <View style={{ alignItems: 'center' }}>
          <AppText variant="heading" style={{ color: '#FFC107' }}>
            {coins.balance}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary}>Available coins</AppText>
        </View>
      </GlassCard>

      <View style={styles.sectionTitle}>
        <AppText variant="subheading">Buy coins</AppText>
      </View>
      <View style={styles.packs}>
        {coinPacks.map((pack) => (
          <LinearGradient
            key={pack.id}
            colors={['rgba(255,193,7,0.14)', 'rgba(255,62,165,0.10)']}
            style={styles.pack}
          >
            <AppText variant="label" style={{ color: '#FFC107' }}>{pack.coins} coins</AppText>
            {pack.bonus ? (
              <AppText variant="caption" color={colors.green}>+{pack.bonus} bonus</AppText>
            ) : (
              <View />
            )}
            <AppText variant="caption" color={colors.textSecondary}>${pack.price}</AppText>
            <GradientButton title="Buy" variant="gold" loading={busy === pack.id} disabled={busy !== null} onPress={() => buy(pack.id)} />
          </LinearGradient>
        ))}
      </View>

      <View style={styles.sectionTitle}>
        <AppText variant="subheading">History</AppText>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTx}
        contentContainerStyle={styles.txList}
        ListEmptyComponent={<EmptyState icon="receipt-outline" title="No transactions" subtitle="Your coin history will appear here." />}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  balance: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  sectionTitle: {
    marginTop: 8,
    marginBottom: 10,
  },
  packs: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  pack: {
    width: '48%',
    flexGrow: 1,
    borderRadius: radius.lg,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    ...shadows.soft,
  },
  txList: {
    gap: 8,
    paddingBottom: 24,
  },
  txRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  txIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
