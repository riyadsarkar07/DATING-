import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { useAuthStore } from '../../store/auth.store';
import { useAppStore } from '../../store/app.store';
import { supportService, SupportMessage, SupportTicket } from '../../services/support.service';
import { RootStackParamList } from '../../navigation/types';
import { colors, radius } from '../../constants/theme';
import { formatDayTime, formatTime } from '../../core/utils/date';

type Route = RouteProp<RootStackParamList, 'TicketDetail'>;

const STATUS_META: Record<SupportTicket['status'], { label: string; color: string }> = {
  open: { label: 'Open', color: colors.blush[500] },
  in_progress: { label: 'In progress', color: colors.violet[400] },
  resolved: { label: 'Resolved', color: colors.green },
  closed: { label: 'Closed', color: colors.textTertiary },
};

export function TicketDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { ticketId } = route.params;
  const uid = useAuthStore((s) => s.uid);
  const showToast = useAppStore((s) => s.showToast);

  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    let active = true;
    supportService.watchTicket(ticketId, (t) => {
      if (active) setTicket(t);
    });
    return () => {
      active = false;
    };
  }, [ticketId]);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    supportService.watchMessages(ticketId, (items) => {
      setMessages(items);
    }).then((fn) => {
      unsub = fn;
    });
    return () => {
      unsub?.();
    };
  }, [ticketId]);

  const scrollToEnd = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

  useEffect(() => {
    scrollToEnd();
  }, [messages, scrollToEnd]);

  const send = async () => {
    const trimmed = text.trim();
    if (!trimmed || !uid || sending) return;
    const status = ticket?.status ?? 'open';
    if (status === 'resolved' || status === 'closed') {
      showToast('This ticket is no longer accepting messages', 'error');
      return;
    }
    setSending(true);
    Keyboard.dismiss();
    try {
      await supportService.sendMessage(ticketId, uid, trimmed);
      setText('');
    } catch {
      showToast('Could not send message', 'error');
    } finally {
      setSending(false);
    }
  };

  const reopen = async () => {
    try {
      await supportService.updateStatus(ticketId, 'open');
      showToast('Ticket reopened', 'success');
    } catch {
      showToast('Could not reopen ticket', 'error');
    }
  };

  const status = STATUS_META[ticket?.status ?? 'open'];
  const closed = ticket?.status === 'resolved' || ticket?.status === 'closed';

  const renderMessage = ({ item, index }: { item: SupportMessage; index: number }) => {
    const isMine = item.senderRole === 'user';
    const prev = messages[index - 1];
    const dayChanged = !prev || !isSameDay(prev.createdAt, item.createdAt);
    const headerShown =
      !prev || prev.senderRole !== item.senderRole || item.createdAt - prev.createdAt > 5 * 60 * 1000;

    return (
      <View>
        {dayChanged ? (
          <View style={styles.dayDivider}>
            <AppText variant="caption" color={colors.textTertiary}>
              {formatDayTime(item.createdAt)}
            </AppText>
          </View>
        ) : null}
        {!isMine && headerShown ? (
          <View style={styles.supportHeader}>
            <View style={styles.supportIcon}>
              <Ionicons name="headset" size={12} color={colors.violet[300]} />
            </View>
            <AppText variant="caption" color={colors.violet[300]}>
              SparkX Support
            </AppText>
          </View>
        ) : null}
        <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
          <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
            <AppText variant="body" color={isMine ? colors.white : colors.offWhite}>
              {item.text}
            </AppText>
          </View>
        </View>
        <View style={[styles.meta, isMine ? styles.metaMine : styles.metaTheirs]}>
          <AppText variant="caption" color={colors.textTertiary}>
            {formatTime(item.createdAt)}
          </AppText>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </Pressable>
          <View style={styles.headerCenter}>
            <AppText variant="label" numberOfLines={1}>
              {ticket?.subject ?? 'Ticket'}
            </AppText>
            <View style={styles.statusRow}>
              <AppText variant="caption" color={status.color}>
                {status.label}
              </AppText>
              {ticket?.priority ? (
                <>
                  <AppText variant="caption" color={colors.textTertiary}>•</AppText>
                  <AppText variant="caption" color={colors.textSecondary}>
                    {ticket.priority}
                  </AppText>
                </>
              ) : null}
            </View>
          </View>
          <View style={styles.headerBtn} />
        </View>

        {closed ? (
          <View style={styles.closedBanner}>
            <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>
              This ticket is {status.label.toLowerCase()}. Open a new ticket if you need further help.
            </AppText>
            {ticket?.status !== 'closed' ? (
              <Pressable onPress={reopen} hitSlop={8}>
                <AppText variant="label" color={colors.violet[300]}>Reopen</AppText>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id ?? `${item.createdAt}`}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="chatbubble-ellipses-outline" size={40} color={colors.violet[400]} />
                <AppText variant="body" color={colors.textSecondary} centered>
                  No messages yet. Send a message and our team will get back to you.
                </AppText>
              </View>
            }
          />

          <View style={styles.inputBar}>
            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Write a message..."
                placeholderTextColor={colors.textTertiary}
                value={text}
                onChangeText={setText}
                multiline
                editable={!closed}
              />
            </View>
            <Pressable
              onPress={send}
              disabled={!text.trim() || sending || closed}
              style={[styles.sendBtn, (!text.trim() || sending || closed) && styles.sendDisabled]}
              hitSlop={6}
            >
              <Ionicons name="send" size={18} color={colors.white} />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function isSameDay(a: number, b: number): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 14,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  list: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexGrow: 1,
  },
  dayDivider: {
    alignItems: 'center',
    marginVertical: 14,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  supportIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(124,77,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    maxWidth: '80%',
  },
  rowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  bubbleMine: {
    backgroundColor: colors.violet[600],
    borderColor: 'rgba(255,255,255,0.12)',
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: colors.surfaceGlassStrong,
    borderColor: colors.borderGlass,
    borderBottomLeftRadius: 6,
  },
  meta: {
    marginTop: 3,
    paddingHorizontal: 4,
  },
  metaMine: {
    alignSelf: 'flex-end',
  },
  metaTheirs: {
    alignSelf: 'flex-start',
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    backgroundColor: colors.ink[900],
  },
  inputWrap: {
    flex: 1,
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    maxHeight: 110,
  },
  input: {
    color: colors.white,
    fontSize: 15,
    paddingVertical: 10,
    fontFamily: 'Poppins_400Regular',
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.violet[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
