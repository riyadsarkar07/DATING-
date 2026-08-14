import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { ProfileCard } from '../../components/home/ProfileCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../store/auth.store';
import { useDiscoveryStore } from '../../store/discovery.store';
import { discoveryService } from '../../services/discovery.service';
import { DiscoveryCandidate } from '../../types/filters';
import { DiscoverSort } from '../../types/enums';
import { colors, layout } from '../../constants/theme';

const CATEGORIES: { key: DiscoverSort; label: string; icon: any }[] = [
  { key: 'suggested', label: 'For You', icon: 'sparkles' },
  { key: 'trending', label: 'Trending', icon: 'flame' },
  { key: 'nearby', label: 'Nearby', icon: 'location' },
  { key: 'verified', label: 'Verified', icon: 'shield-checkmark' },
  { key: 'recent', label: 'Active Now', icon: 'time' },
  { key: 'premium', label: 'Premium', icon: 'diamond' },
];

export function DiscoverScreen() {
  const navigation = useNavigation();
  const profile = useAuthStore((s) => s.profile);
  const filter = useDiscoveryStore((s) => s.filter);
  const [category, setCategory] = useState<DiscoverSort>('suggested');
  const [users, setUsers] = useState<DiscoveryCandidate[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);
    try {
      const items = await discoveryService.fetchCandidates(profile, { ...filter, sortBy: category }, [], 40);
      setUsers(items);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [profile, filter, category]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View>
            <AppText variant="heading">Discover</AppText>
            <AppText variant="caption" color={colors.textSecondary}>
              Find people who match your vibe
            </AppText>
          </View>
          <Pressable
            onPress={() => (navigation as any).navigate('DiscoverFilters')}
            style={styles.filterBtn}
            hitSlop={8}
          >
            <Ionicons name="options" size={20} color={colors.violet[300]} />
          </Pressable>
        </View>

        <View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories}>
            {CATEGORIES.map((c) => {
              const active = category === c.key;
              return (
                <Pressable
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  <Ionicons name={c.icon} size={14} color={active ? colors.white : colors.textSecondary} />
                  <AppText variant="label" color={active ? colors.white : colors.textSecondary}>
                    {c.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {loading ? (
          <View style={styles.center}>
            <Spinner label="Searching for matches..." />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.center}>
            <EmptyState
              icon="search-outline"
              title="No one found"
              subtitle="Try a different category or adjust your filters to discover more people."
              actionLabel="Adjust filters"
              onAction={() => (navigation as any).navigate('DiscoverFilters')}
            />
          </View>
        ) : (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.grid}
            refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor={colors.violet[400]} />}
          >
            {users.map((u) => (
              <ProfileCard
                key={u.uid}
                user={u}
                matchScore={u.matchScore}
                likesYou={u.likesYou}
                onPress={() => (navigation as any).navigate('ProfileDetail', { uid: u.uid })}
              />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 10,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categories: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: 6,
    gap: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  categoryChipActive: {
    backgroundColor: colors.violet[600],
    borderColor: colors.violet[500],
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingTop: 10,
    gap: 8,
  },
});
