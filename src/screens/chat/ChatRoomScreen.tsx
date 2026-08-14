import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Pressable, KeyboardAvoidingView, Platform, TextInput } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Avatar } from '../../components/ui/Avatar';
import { MessageBubble } from '../../components/chat/MessageBubble';
import { TypingIndicator } from '../../components/chat/TypingIndicator';
import { ChatInputBar } from '../../components/chat/ChatInputBar';
import { AppModal } from '../../components/ui/AppModal';
import { useAuthStore } from '../../store/auth.store';
import { usePremiumStore } from '../../store/premium.store';
import { messageService } from '../../services/message.service';
import { matchService } from '../../services/match.service';
import { userService } from '../../services/user.service';
import { ChatMessage } from '../../types/chat';
import { RootStackParamList } from '../../navigation/types';
import { colors, radius, layout } from '../../constants/theme';
import { debounce } from '../../core/utils/async';

type Route = RouteProp<RootStackParamList, 'ChatRoom'>;

const EMOJI_QUICK = ['❤️', '😂', '😍', '👍', '🔥', '😘'];

export function ChatRoomScreen() {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { matchId } = route.params;
  const uid = useAuthStore((s) => s.uid);
  const profile = useAuthStore((s) => s.profile);
  const readReceipts = usePremiumStore((s) => s.premium.entitlements.readReceipts);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peer, setPeer] = useState<{ uid: string; name: string; photo: string | null; online: boolean; verified: boolean } | null>(null);
  const [peerTyping, setPeerTyping] = useState(false);
  const [search, setSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState<ChatMessage | null>(null);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const listRef = useRef<FlatList>(null);

  const peerUid = useMemo(() => {
    if (!messages.length) return null;
    return messages.find((m) => m.senderId !== uid)?.senderId ?? null;
  }, [messages, uid]);

  useEffect(() => {
    const unsub = matchService.watchMatch(matchId, (data) => {
      const typingUids = data.typingUsers ?? [];
      setPeerTyping(typingUids.includes(peerUid ?? ''));
    });
    return unsub;
  }, [matchId, peerUid]);

  useEffect(() => {
    const unsub = messageService.watchMessages(matchId, async (items) => {
      setMessages(items);
      const myUid = uid;
      if (!myUid) return;
      const unreadMine = items
        .filter((m) => m.senderId !== myUid && !m.readAt && !m.deleted && m.kind !== 'system')
        .map((m) => m.id);
      if (unreadMine.length) {
        messageService.markReadMessages(matchId, myUid, unreadMine);
      }
    });
    return unsub;
  }, [matchId, uid]);

  useEffect(() => {
    if (!peerUid) return;
    let active = true;
    let unsub: (() => void) | null = null;
    const loadPeer = async () => {
      const p = await userService.getProfile(peerUid);
      if (p && active) {
        setPeer({ uid: p.uid, name: p.displayName, photo: p.photos?.[0] ?? null, online: p.online, verified: p.verified });
      }
    };
    loadPeer();
    userService.watchProfile(peerUid, (p) => {
      if (p && active) setPeer({ uid: p.uid, name: p.displayName, photo: p.photos?.[0] ?? null, online: p.online, verified: p.verified });
    }).then((u) => {
      if (active) unsub = u;
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, [peerUid]);

  const emitTyping = useCallback(
    debounce((typing: boolean) => {
      if (uid) messageService.setTyping(matchId, uid, typing);
    }, 800),
    [matchId, uid],
  );

  const sendText = useCallback(
    async (text: string) => {
      if (!uid) return;
      emitTyping(false);
      await messageService.sendText(matchId, uid, text, replyTo ? { id: replyTo.id, senderId: replyTo.senderId, text: replyTo.text ?? '', kind: replyTo.kind } : null);
      setReplyTo(null);
    },
    [matchId, uid, replyTo, emitTyping],
  );

  const openCall = (type: 'voice' | 'video') => {
    if (!peer) return;
    const params = { matchId, peer: {
      uid: peer.uid,
      displayName: peer.name,
      photos: peer.photo ? [peer.photo] : [],
      age: 0,
      gender: 'non_binary',
      occupation: '',
      bio: '',
      distanceKm: null,
      online: peer.online,
      lastActive: Date.now(),
      verified: peer.verified,
      premium: false,
      premiumTier: null,
      boostUntil: null,
      hobbies: [],
      languages: [],
      religion: '',
      education: '',
      height: null,
      city: '',
      country: '',
      videoIntro: null,
      instagram: '',
      spotify: '',
    } as any, direction: 'outgoing' as const };
    (navigation as any).navigate(type === 'voice' ? 'VoiceCall' : 'VideoCall', params);
  };

  const filteredMessages = useMemo(() => {
    if (!searchTerm) return messages;
    const q = searchTerm.toLowerCase();
    return messages.filter((m) => (m.text ?? '').toLowerCase().includes(q));
  }, [messages, searchTerm]);

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isMine = item.senderId === uid;
    const prevIndex = messages.findIndex((m) => m.id === item.id);
    const prev = messages[prevIndex - 1];
    const showHeader =
      !prev ||
      prev.senderId !== item.senderId ||
      item.createdAt - prev.createdAt > 5 * 60 * 1000;

    return (
      <View style={styles.msgWrap}>
        {showHeader && item.senderId !== uid && item.kind !== 'system' ? (
          <AppText variant="caption" color={colors.textTertiary} style={styles.msgHeader}>
            {peer?.name}
          </AppText>
        ) : null}
        <MessageBubble
          message={item}
          isMine={isMine}
          readReceiptsEnabled={readReceipts}
          onLongPress={() => setActionMessage(item)}
        />
      </View>
    );
  };

  const actions = [
    { icon: 'arrow-undo-outline', label: 'Reply', onPress: () => { setReplyTo(actionMessage); setActionMessage(null); } },
    { icon: 'trash-outline', label: 'Delete', onPress: () => { if (actionMessage) messageService.deleteMessage(actionMessage); setActionMessage(null); } },
    { icon: 'copy-outline', label: 'Copy', onPress: () => { setActionMessage(null); } },
  ];

  return (
    <LinearGradient colors={['#05050A', '#0B0B18', '#05050A']} style={styles.bg}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.white} />
          </Pressable>
          <Pressable
            style={styles.peer}
            onPress={() => peer && (navigation as any).navigate('ProfileDetail', { uid: peer.uid })}
          >
            <Avatar uri={peer?.photo} size={40} online={peer?.online} />
            <View>
              <View style={styles.peerNameRow}>
                <AppText variant="label">{peer?.name ?? 'Loading...'}</AppText>
                {peer?.verified ? <Ionicons name="shield-checkmark" size={13} color="#38CFFC" /> : null}
              </View>
              {peerTyping ? (
                <AppText variant="caption" color={colors.violet[300]}>typing...</AppText>
              ) : (
                <AppText variant="caption" color={peer?.online ? colors.green : colors.textTertiary}>
                  {peer?.online ? 'Online' : 'Offline'}
                </AppText>
              )}
            </View>
          </Pressable>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setSearch((s) => !s)} style={styles.headerBtn} hitSlop={8}>
              <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => openCall('voice')} style={styles.headerBtn} hitSlop={8}>
              <Ionicons name="call-outline" size={20} color={colors.green} />
            </Pressable>
            <Pressable onPress={() => openCall('video')} style={styles.headerBtn} hitSlop={8}>
              <Ionicons name="videocam-outline" size={20} color={colors.aqua[400]} />
            </Pressable>
          </View>
        </View>

        {search ? (
          <View style={styles.searchBar}>
            <TextInput
              value={searchTerm}
              onChangeText={setSearchTerm}
              placeholder="Search in conversation..."
              placeholderTextColor={colors.textTertiary}
              style={styles.searchInput}
              autoFocus
            />
            <Pressable onPress={() => { setSearch(false); setSearchTerm(''); }} hitSlop={8}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </Pressable>
          </View>
        ) : null}

        {replyTo ? (
          <View style={styles.replyBar}>
            <Ionicons name="arrow-undo" size={16} color={colors.violet[300]} />
            <AppText variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ flex: 1 }}>
              Replying: {replyTo.text || 'Attachment'}
            </AppText>
            <Pressable onPress={() => setReplyTo(null)} hitSlop={8}>
              <Ionicons name="close" size={18} color={colors.textTertiary} />
            </Pressable>
          </View>
        ) : null}

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
          <FlatList
            ref={listRef}
            data={filteredMessages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <View style={styles.emptyChat}>
                <Ionicons name="heart" size={40} color={colors.blush[500]} />
                <AppText variant="heading" style={{ marginTop: 12 }}>
                  You matched!
                </AppText>
                <AppText variant="body" color={colors.textSecondary} centered>
                  Say hi and start the conversation.
                </AppText>
                <View style={styles.quickRow}>
                  {EMOJI_QUICK.map((e) => (
                    <Pressable key={e} onPress={() => uid && messageService.sendEmoji(matchId, uid, e)} style={styles.quickEmoji}>
                      <AppText style={{ fontSize: 26 }}>{e}</AppText>
                    </Pressable>
                  ))}
                </View>
              </View>
            }
          />
          {peerTyping ? <View style={styles.typingWrap}><TypingIndicator /></View> : null}
          <ChatInputBar
            onSendText={sendText}
            onSendImage={(uri) => uid && messageService.sendImage(matchId, uid, uri)}
            onSendVideo={(uri) => uid && messageService.sendVideo(matchId, uid, uri)}
            onSendVoice={(uri, ms) => uid && messageService.sendVoice(matchId, uid, uri, ms)}
            onSendGif={(url) => uid && messageService.sendGif(matchId, uid, url)}
            onSendEmoji={(e) => uid && messageService.sendEmoji(matchId, uid, e)}
            onTyping={(t) => emitTyping(t)}
          />
        </KeyboardAvoidingView>

        <AppModal visible={!!actionMessage} onClose={() => setActionMessage(null)} heightRatio={0.32}>
          <View style={styles.actionSheet}>
            {actions.map((a) => (
              <Pressable key={a.label} style={styles.actionRow} onPress={a.onPress}>
                <Ionicons name={a.icon as any} size={20} color={a.label === 'Delete' ? colors.red : colors.white} />
                <AppText variant="body" color={a.label === 'Delete' ? colors.red : colors.white}>
                  {a.label}
                </AppText>
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
  peer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  peerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerActions: {
    flexDirection: 'row',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.surfaceGlass,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.white,
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  replyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(124,77,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 12,
    borderRadius: radius.md,
    marginBottom: 4,
  },
  list: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexGrow: 1,
  },
  msgWrap: {
    marginVertical: 2,
  },
  msgHeader: {
    marginLeft: 4,
    marginTop: 8,
    marginBottom: 2,
  },
  typingWrap: {
    paddingHorizontal: 14,
    paddingBottom: 4,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 20,
  },
  quickEmoji: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surfaceGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionSheet: {
    padding: 16,
    gap: 4,
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
