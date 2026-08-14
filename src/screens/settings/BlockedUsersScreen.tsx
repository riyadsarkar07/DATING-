import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Screen } from '../../components/ui/Screen';
import { Avatar } from '../../components/ui/Avatar';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/auth.store';
import { userService } from '../../services/user.service';
import { PublicUserSummary } from '../../types/user';
import { colors, layout, radius } from '../../constants/theme';

export function BlockedUsersScreen({ navigation }: any) {
  const uid = useAuthStore((s) => s.uid);
  const [blocked, setBlocked] = useState<PublicUserSummary[]>([]);

  const load = useCallback(async () => {
    if (!uid) return;
    const list = await userService.getBlockedUsers(uid);
    setBlocked(list);
  }, [uid]);

  useEffect(() => {
    load();
  }, [load]);

  const unblock = async (targetUid: string) => {
    if (!uid) return;
    await userService.unblockUser(uid, targetUid);
    load();
  };

  const renderRow = ({ item }: { item: PublicUserSummary }) => (
    <View style={styles.row}>
      <Avatar uri={item.photos?.[0]} size={48} />
      <View style={{ flex: 1 }}>
        <AppText variant="label">{item.displayName}</AppText>
        <AppText variant="caption" color={colors.textTertiary}>
          {item.age} · {item.city || item.country}
        </AppText>
      </View>
      <Pressable onPress={() => unblock(item.uid)} hitSlop={8} style={styles.unblockBtn}>
        <AppText variant="caption" color={colors.violet[400]}>Unblock</AppText>
      </Pressable>
    </View>
  );

  return (
    <Screen headerTitle="Blocked Users" onBack={navigation.goBack}>
      <FlatList
        data={blocked}
        keyExtractor={(item) => item.uid}
        renderItem={renderRow}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState icon="shield-outline" title="No blocked users" subtitle="Users you block will appear here." />
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
  },
  unblockBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: 'rgba(124,58,237,0.15)',
  },
});
