import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Badge } from '../../components/ui/Badge';
import { SwipeDeck, SwipeDeckHandle } from '../../components/home/SwipeDeck';
import { ActionBar } from '../../components/home/ActionBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Spinner } from '../../components/ui/Spinner';
import { useDiscoveryStore } from '../../store/discovery.store';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { usePremiumStore } from '../../store/premium.store';
import { swipeService } from '../../services/swipe.service';
import { SwipeDirection } from '../../types/enums';
import { DiscoveryCandidate } from '../../types/filters';
import { colors, layout } from '../../constants/theme';

export function HomeScreen() {
  const navigation = useNavigation();
  const profile = useAuthStore((s) => s.profile);
  const candidates = useDiscoveryStore((s) => s.candidates);
  const loading = useDiscoveryStore((s) => s.loading);
  const refresh = useDiscoveryStore((s) => s.refresh);
  const removeTop = useDiscoveryStore((s) => s.removeTop);
  const showToast = useAppStore((s) => s.showToast);
  const boostActive = usePremiumStore((s) => s.boost.active);

  const deckRef = useRef<SwipeDeckHandle>(null);
  const [swiping, setSwiping] = useState(false);
  const [removedStack, setRemovedStack] = useState<DiscoveryCandidate[]>([]);

  useEffect(() => {
    if (profile) {
      refresh(profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.uid]);

  const handleSwipe = useCallback(
    async (direction: SwipeDirection) => {
      if (!profile) return;
      const top = useDiscoveryStore.getState().candidates[0];
      if (!top) return;
      setSwiping(true);
      try {
        const result = await swipeService.recordSwipe(profile.uid, top.uid, direction);
        setRemovedStack((stack) => [top, ...stack].slice(0, 10));
        removeTop();
        if (result.matched) {
          (navigation as any).navigate('MatchPopup', {
            matchId: result.matchId,
            candidateUid: top.uid,
            candidateName: top.displayName,
            candidatePhotos: top.photos,
          });
        }
      } catch (err) {
        showToast((err as Error).message, 'error');
      } finally {
        setSwiping(false);
      }
    },
    [profile, removeTop, navigation, showToast],
  );

  const rewind = () => {
    const [last, ...rest] = removedStack;
    if (!last) {
      showToast('Nothing to rewind', 'info');
      return;
    }
    setRemovedStack(rest);
    useDiscoveryStore.getState().setCandidates([last, ...useDiscoveryStore.getState().candidates]);
  };

  const trigger = (direction: SwipeDirection) => {
    if (swiping) return;
    deckRef.current?.trigger(direction);
  };

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {boostActive ? <Badge kind="boost" label="Boosted" /> : <View style={{ width: 44 }} />}
          </View>
          <AppText variant="heading" style={styles.logo}>
            Spark<AppText variant="heading" color={colors.blush[500]}>X</AppText>
          </AppText>
          <View style={styles.headerRight}>
            <Pressable onPress={() => (navigation as any).navigate('Coins')} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="logo-bitcoin" size={20} color="#FFC53D" />
            </Pressable>
            <Pressable onPress={() => (navigation as any).navigate('Premium')} style={styles.iconBtn} hitSlop={8}>
              <Ionicons name="diamond" size={20} color="#FFC53D" />
            </Pressable>
          </View>
        </View>

        {loading && candidates.length === 0 ? (
          <View style={styles.center}>
            <Spinner label="Finding people near you..." />
          </View>
        ) : candidates.length === 0 ? (
          <View style={styles.center}>
            <EmptyState
              icon="sparkles-outline"
              title="You're all caught up"
              subtitle="There are no more profiles for your current filters. Come back later or broaden your filters."
              actionLabel="Refresh"
              onAction={() => profile && refresh(profile)}
            />
          </View>
        ) : (
          <>
            <View style={styles.deckWrap}>
              <SwipeDeck ref={deckRef} candidates={candidates} onSwipe={handleSwipe} />
            </View>
            <ActionBar
              onRewind={rewind}
              onPass={() => trigger('pass')}
              onSuperLike={() => trigger('super_like')}
              onLike={() => trigger('like')}
              onBoost={() => (navigation as any).navigate('Boost')}
              disabled={swiping}
            />
          </>
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
  headerLeft: {
    width: 70,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    letterSpacing: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deckWrap: {
    flex: 1,
    marginTop: 8,
  },
});
