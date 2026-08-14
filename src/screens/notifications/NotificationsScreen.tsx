import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { Screen } from '../../components/ui/Screen';
import { useNotificationStore } from '../../store/notification.store';
import { useAuthStore } from '../../store/auth.store';
import { notificationService } from '../../services/notification.service';
import { AppNotification } from '../../types/notification';
import { colors, layout, radius, shadows } from '../../constants/theme';
import { timeAgo } from '../../core/utils/date';

const ICONS: Record<string, { name: any; color: string }> = {
  like: { name: 'heart', color: '#FF3EA5' },
  match: { name: 'sparkles', color: colors.violet[500] },
  message: { name: 'chatbubble', color: colors.green },
  call: { name: 'call', color: colors.green },
  boost: { name: 'flash', color: '#FFC107' },
  coins: { name: 'diamond', color: '#FFC107' },
  premium: { name: 'crown', color: '#FFC107' },
  system: { name: 'notifications', color: colors.violet[400] },
};

export function NotificationsScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const items = useNotificationStore((s) => s.items);
  const setItems = useNotificationStore((s) => s.setItems);

  useEffect(() => {
    if (!uid) return;
    const unsub = notificationService.watchNotifications(uid, setItems);
    return unsub;
  }, [uid, setItems]);

  const markAll = async () => {
    if (!uid) return;
    useNotificationStore.getState().markAllReadLocal();
    await notificationService.markAllRead(uid);
  };

  const onPress = async (item: AppNotification) => {
    useNotificationStore.getState().markReadLocal(item.id);
    await notificationService.markRead(item.id);
    if (item.link === 'chat' && item.matchId) {
      navigation.navigate('ChatRoom', { matchId: item.matchId });
    } else if (item.link === 'calls') {
      navigation.navigate('CallHistory');
    } else if (item.link === 'premium') {
      navigation.navigate('Premium');
    } else if (item.link === 'coins') {
      navigation.navigate('Coins');
    }
  };

  const renderRow = ({ item }: { item: AppNotification }) => {
    const cfg = ICONS[item.type] || ICONS.system;
    return (
      <Pressable
        onPress={() => onPress(item)}
        style={({ pressed }) => [styles.row, pressed && { opacity: 0.8 }, !item.read && styles.unreadRow]}
      >
        <View style={[styles.iconWrap, { backgroundColor: cfg.color + '22' }]}>
          <Ionicons name={cfg.name} size={18} color={cfg.color} />
        </View>
        {item.fromPhoto ? (
          <Avatar uri={item.fromPhoto} size={44} />
        ) : null}
        <View style={styles.body}>
          <AppText variant="body" color={colors.white}>
            {item.title}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={2}>
            {item.body}
          </AppText>
        </View>
        <View style={styles.side}>
          <AppText variant="caption" color={colors.textTertiary}>
            {timeAgo(item.createdAt)}
          </AppText>
          {!item.read ? <View style={styles.dot} /> : null}
        </View>
      </Pressable>
    );
  };

  return (
    <Screen
      headerTitle="Notifications"
      onBack={navigation.goBack}
      headerRight={
        items.some((i) => !i.read) ? (
          <Pressable onPress={markAll} hitSlop={12}>
            <AppText variant="caption" color={colors.violet[400]}>
              Mark all read
            </AppText>
          </Pressable>
        ) : undefined
      }
    >
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="notifications-off-outline" title="No notifications" subtitle="Likes, matches and updates will show up here." />
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
    gap: 12,
    padding: 12,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceGlass,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    ...shadows.soft,
  },
  unreadRow: {
    borderColor: colors.violet[700],
    backgroundColor: 'rgba(124,58,237,0.10)',
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  side: { alignItems: 'flex-end', gap: 6 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3EA5',
  },
});
