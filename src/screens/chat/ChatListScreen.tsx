import React, { useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, TextInput, SectionList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { AppModal } from '../../components/ui/AppModal';
import { useChatStore } from '../../store/chat.store';
import { useAuthStore } from '../../store/auth.store';
import { matchService } from '../../services/match.service';
import { Match } from '../../types/chat';
import { colors, layout, radius, shadows } from '../../constants/theme';
import { timeAgo } from '../../core/utils/date';

export function ChatListScreen() {
  const navigation = useNavigation();
  const matches = useChatStore((s) => s.matches);
  const setActiveMatch = useChatStore((s) => s.setActiveMatch);
  const uid = useAuthStore((s) => s.uid);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Match | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const list = matches.filter((m) => !q || (m.otherUser.displayName || '').toLowerCase().includes(q));
    const visible = list.filter((m) => !m.isArchived && m.status === 'active');
    return [...visible.filter((m) => m.isPinned), ...visible.filter((m) => !m.isPinned)];
  }, [matches, query]);

  const renderRow = ({ item }: { item: Match }) => (
    <Pressable
      onPress={() => {
        setActiveMatch(item.id);
        (navigation as any).navigate('ChatRoom', { matchId: item.id });
      }}
      onLongPress={() => setSelected(item)}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }]}
    >
      <View>
        <Avatar uri={item.otherUser.photos?.[0]} size={54} online={item.otherUser.online} />
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHeader}>
          <AppText variant="label" numberOfLines={1} style={styles.rowName}>
            {item.otherUser.displayName}
          </AppText>
          <AppText variant="caption" color={colors.textTertiary}>
            {timeAgo(item.lastMessageAt)}
          </AppText>
        </View>
        <View style={styles.rowBottom}>
          <AppText
            variant="caption"
            color={item.unseenCount > 0 ? colors.white : colors.textSecondary}
            numberOfLines={1}
            style={styles.preview}
          >
            {item.lastMessagePreview || 'Say hi! 👋'}
          </AppText>
          {item.unseenCount > 0 ? (
            <View style={styles.unseen}>
              <AppText variant="caption" style={styles.unseenText}>{item.unseenCount}</AppText>
            </View>
          ) : null}
          {item.isMuted ? <Ionicons name="notifications-off-outline" size={14} color={colors.textTertiary} /> : null}
        </View>
      </View>
    </Pressable>
  );

  const actions = [
    {
      label: selected?.isPinned ? 'Unpin' : 'Pin',
      icon: 'pin-outline',
      onPress: async () => {
        if (selected) await matchService.togglePin(selected.id, !selected.isPinned);
        setSelected(null);
      },
    },
    {
      label: selected?.isMuted ? 'Unmute' : 'Mute',
      icon: selected?.isMuted ? 'notifications' : 'notifications-off-outline',
      onPress: async () => {
        if (selected) await matchService.toggleMute(selected.id, !selected.isMuted);
        setSelected(null);
      },
    },
    {
      label: 'Archive',
      icon: 'archive-outline',
      onPress: async () => {
        if (selected) await matchService.toggleArchive(selected.id, true);
        setSelected(null);
      },
    },
  ];

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <AppText variant="heading">Chats</AppText>
          <Pressable onPress={() => (navigation as any).navigate('CallHistory')} style={styles.iconBtn} hitSlop={8}>
            <Ionicons name="call-outline" size={20} color={colors.green} />
          </Pressable>
        </View>

        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textTertiary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search chats..."
            placeholderTextColor={colors.textTertiary}
            style={styles.searchInput}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderRow}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="chatbubbles-outline"
              title="No conversations"
              subtitle="Match with someone to start chatting."
              actionLabel="Find matches"
              onAction={() => (navigation as any).navigate('Main', { screen: 'Home' })}
            />
          }
        />

        <AppModal visible={!!selected} onClose={() => setSelected(null)} heightRatio={0.4}>
          <View style={styles.sheet}>
            {selected ? (
              <View style={styles.sheetHeader}>
                <Avatar uri={selected.otherUser.photos?.[0]} size={56} />
                <View>
                  <AppText variant="label">{selected.otherUser.displayName}</AppText>
                  <AppText variant="caption" color={colors.textTertiary}>
                    Chat options
                  </AppText>
                </View>
              </View>
            ) : null}
            {actions.map((a) => (
              <Pressable key={a.label} style={styles.actionRow} onPress={a.onPress}>
                <Ionicons name={a.icon as any} size={20} color={colors.white} />
                <AppText variant="body">{a.label}</AppText>
              </Pressable>
            ))}
          </View>
        </AppModal>
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
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: layout.screenPadding,
    marginBottom: 8,
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.full,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    color: colors.white,
    paddingVertical: 11,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
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
    gap: 8,
  },
  preview: {
    flex: 1,
  },
  unseen: {
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
  sheet: {
    padding: 16,
    gap: 4,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radius.md,
  },
});
