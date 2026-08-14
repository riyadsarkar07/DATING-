import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import { Match } from '../../types/chat';
import { colors, layout, radius, shadows } from '../../constants/theme';
import { timeAgo } from '../../core/utils/date';

export function MatchesScreen() {
  const navigation = useNavigation();
  const matches = useChatStore((s) => s.matches);
  const setActiveMatch = useChatStore((s) => s.setActiveMatch);
  const profile = useAuthStore((s) => s.profile);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);

  const visible = matches.filter((m) => !m.isArchived && m.status === 'active');
  const pinned = visible.filter((m) => m.isPinned);
  const unpinned = visible.filter((m) => !m.isPinned);

  const renderMatch = ({ item }: { item: Match }) => (
    <MatchRow
      match={item}
      now={now}
      onPress={() => {
        setActiveMatch(item.id);
        (navigation as any).navigate('ChatRoom', { matchId: item.id });
      }}
    />
  );

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <AppText variant="heading">Matches</AppText>
          <Pressable onPress={() => (navigation as any).navigate('Premium')} style={styles.likeBtn} hitSlop={8}>
            <Ionicons name="heart" size={18} color="#FF3EA5" />
          </Pressable>
        </View>

        <FlatList
          data={[...pinned, ...unpinned]}
          keyExtractor={(item) => item.id}
          renderItem={renderMatch}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="heart-outline"
              title="No matches yet"
              subtitle="Keep swiping! When you both like each other, your matches will appear here."
            />
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

function MatchRow({ match, now, onPress }: { match: Match; now: number; onPress: () => void }) {
  const isOnline = match.otherUser.online;
  const unseen = match.unseenCount > 0;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}>
      <View>
        <Avatar uri={match.otherUser.photos?.[0]} size={58} online={isOnline} />
        {match.isPinned ? (
          <View style={styles.pinBadge}>
            <Ionicons name="pin" size={10} color={colors.white} />
          </View>
        ) : null}
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <AppText variant="label" numberOfLines={1} style={styles.rowName}>
            {match.otherUser.displayName}
          </AppText>
          <AppText variant="caption" color={colors.textTertiary}>
            {timeAgo(Math.max(match.lastMessageAt, now - 90000))}
          </AppText>
        </View>
        <View style={styles.rowBottom}>
          {match.otherUser.verified ? <Ionicons name="shield-checkmark" size={12} color="#38CFFC" /> : null}
          <AppText
            variant="caption"
            color={unseen ? colors.white : colors.textSecondary}
            numberOfLines={1}
            style={styles.preview}
          >
            {match.typingUsers?.length ? `${match.otherUser.displayName} is typing...` : match.lastMessagePreview || 'Say hi! 👋'}
          </AppText>
          {unseen ? (
            <View style={styles.unseenBadge}>
              <AppText variant="caption" style={styles.unseenText}>{match.unseenCount}</AppText>
            </View>
          ) : null}
        </View>
      </View>
      {match.otherUser.premium ? (
        <Ionicons name="diamond" size={14} color="#FFC53D" />
      ) : null}
    </Pressable>
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
  likeBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    padding: layout.screenPadding,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    ...shadows.soft,
  },
  pinBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.violet[600],
    borderRadius: 8,
    padding: 2,
  },
  rowBody: {
    flex: 1,
    gap: 3,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowName: {
    fontSize: 15,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  preview: {
    flex: 1,
  },
  unseenBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FF3EA5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unseenText: {
    color: colors.white,
    fontSize: 10,
    lineHeight: 12,
  },
});
