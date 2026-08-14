import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { useAuthStore } from '../../store/auth.store';
import { callService } from '../../services/call.service';
import { userService } from '../../services/user.service';
import { CallRecord } from '../../types/chat';
import { colors, layout, radius, shadows } from '../../constants/theme';
import { timeAgo } from '../../core/utils/date';

export function CallHistoryScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const [records, setRecords] = useState<CallRecord[]>([]);
  const [peers, setPeers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!uid) return;
    const unsub = callService.watchHistory(uid, async (list) => {
      setRecords(list);
      const ids = Array.from(new Set(list.flatMap((r) => [r.callerId, r.calleeId]).filter((id) => id !== uid)));
      const users = await userService.getPublicUsers(ids);
      const map: Record<string, any> = {};
      users.forEach((u) => {
        map[u.uid] = u;
      });
      setPeers(map);
    });
    return unsub;
  }, [uid]);

  const peerFor = (r: CallRecord) => (r.callerId === uid ? peers[r.calleeId] : peers[r.callerId]);
  const isOutgoing = (r: CallRecord) => r.callerId === uid;

  const renderRow = ({ item }: { item: CallRecord }) => {
    const peer = peerFor(item);
    const outgoing = isOutgoing(item);
    const icon = item.type === 'video' ? 'videocam' : 'call';
    return (
      <Pressable style={styles.row}>
        <Avatar uri={peer?.photos?.[0]} size={48} />
        <View style={styles.rowBody}>
          <AppText variant="label">{peer?.displayName || 'Unknown'}</AppText>
          <View style={styles.rowMeta}>
            <Ionicons
              name={outgoing ? 'arrow-up-outline' : 'arrow-down-outline'}
              size={13}
              color={item.status === 'missed' ? colors.red : colors.green}
            />
            <Ionicons name={icon} size={13} color={colors.textSecondary} />
            <AppText variant="caption" color={colors.textSecondary}>
              {item.status === 'missed' ? 'Missed' : item.status === 'ended' ? `${item.durationSec}s` : 'Ongoing'}
            </AppText>
            <AppText variant="caption" color={colors.textTertiary}>
              · {timeAgo(item.startedAt)}
            </AppText>
          </View>
        </View>
        {item.type === 'video' ? (
          <Ionicons name="videocam" size={18} color={colors.violet[500]} />
        ) : null}
      </Pressable>
    );
  };

  return (
    <Screen headerTitle="Call History" onBack={navigation.goBack}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="call-outline" title="No calls yet" subtitle="Your call history will appear here." />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  rowBody: { flex: 1, gap: 2 },
  rowMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
