import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import FastImage from 'react-native-fast-image';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../../components/ui/AppText';
import { Avatar } from '../../components/ui/Avatar';
import { useAuthStore } from '../../store/auth.store';
import { callService } from '../../services/call.service';
import { CallType } from '../../types/enums';
import { RootStackParamList } from '../../navigation/types';
import { colors, radius, shadows } from '../../constants/theme';
import { formatDuration } from '../../core/utils/date';

type Route = RouteProp<RootStackParamList, 'VoiceCall' | 'VideoCall'>;

interface CallScreenProps {
  type: CallType;
}

export function CallScreen({ type }: CallScreenProps) {
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { peer, direction, signalId } = route.params;
  const uid = useAuthStore((s) => s.uid);
  const { height } = useWindowDimensions();

  const [status, setStatus] = useState<'ringing' | 'connected' | 'declined' | 'ended'>('ringing');
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(true);
  const [mySignalId, setMySignalId] = useState<string | undefined>(signalId);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endedRef = useRef(false);

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    }).catch(() => {});
    return () => {
      Audio.setAudioModeAsync({ staysActiveInBackground: false }).catch(() => {});
    };
  }, []);

  useEffect(() => {
    let unsub: (() => void) | null = null;
    if (direction === 'outgoing') {
      if (!uid) return;
      callService.initiate(peer.uid, uid, route.params.matchId, type).then((id) => {
        setMySignalId(id);
        unsub = callService.watchSignal(peer.uid, id, (sig) => {
          if (!sig) return;
          if (sig.status === 'answered') {
            setStatus('connected');
            startTimer();
          } else if (sig.status === 'declined' || sig.status === 'ended') {
            setStatus(sig.status === 'declined' ? 'declined' : 'ended');
            stopTimer();
          }
        });
      });
    } else {
      if (signalId && uid) {
        unsub = callService.watchSignal(uid, signalId, (sig) => {
          if (sig && (sig.status === 'ended' || sig.status === 'declined')) {
            setStatus(sig.status);
            stopTimer();
          }
        });
      }
    }
    return () => unsub?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTimer = () => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const finish = useCallback(async () => {
    if (endedRef.current) return;
    endedRef.current = true;
    stopTimer();
    if (uid) {
      if (direction === 'outgoing' && mySignalId) {
        await callService.end(mySignalId, peer.uid, uid, type, route.params.matchId);
      } else {
        await callService.record(uid, peer.uid, type, elapsed > 0 ? 'ended' : 'missed', route.params.matchId, elapsed, 'callee');
      }
    }
    navigation.goBack();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, peer.uid, mySignalId, direction, elapsed, type]);

  const answer = async () => {
    if (signalId && uid) {
      await callService.answer(signalId, uid);
      setStatus('connected');
      startTimer();
    }
  };

  const decline = async () => {
    if (signalId && uid) {
      await callService.decline(signalId, uid);
      await callService.record(peer.uid, uid, type, 'missed', route.params.matchId, 0, 'caller');
    }
    navigation.goBack();
  };

  const toggleMute = () => {
    setMuted((m) => !m);
    Audio.setAudioModeAsync({ allowsRecordingIOS: !muted }).catch(() => {});
  };

  const circleSize = Math.min(height * 0.32, 300);

  return (
    <LinearGradient colors={['#05050A', '#160A2C', '#2E0A3A']} style={styles.bg}>
      {peer.photos?.[0] ? (
        <FastImage source={{ uri: peer.photos[0] }} style={StyleSheet.absoluteFill} resizeMode={FastImage.resizeMode.cover} />
      ) : null}
      <View style={styles.overlay} />

      <View style={styles.content}>
        <Avatar uri={peer.photos?.[0]} size={circleSize} />
        <AppText variant="title" style={styles.name}>
          {peer.displayName}
        </AppText>
        <AppText variant="label" color={colors.textSecondary}>
          {status === 'connected'
            ? `${type === 'video' ? 'Video call' : 'Voice call'} · ${formatDuration(elapsed)}`
            : status === 'declined'
              ? 'Call declined'
              : direction === 'incoming'
                ? 'Incoming call...'
                : 'Ringing...'}
        </AppText>

        <View style={styles.controls}>
          {status === 'connected' ? (
            <>
              <ControlButton icon="mic-off-outline" label="Mute" active={muted} onPress={toggleMute} />
              <ControlButton icon={speaker ? 'volume-high-outline' : 'volume-mute-outline'} label="Speaker" active={speaker} onPress={() => setSpeaker((s) => !s)} />
            </>
          ) : null}

          {direction === 'incoming' && status === 'ringing' ? (
            <View style={styles.incomingActions}>
              <Pressable onPress={decline} style={[styles.endBtn, { backgroundColor: colors.red }]}>
                <Ionicons name="call" size={28} color={colors.white} />
              </Pressable>
              <Pressable onPress={answer} style={[styles.endBtn, { backgroundColor: colors.green }]}>
                <Ionicons name="call" size={28} color={colors.white} />
              </Pressable>
            </View>
          ) : (
            <Pressable onPress={finish} style={styles.endBtn}>
              <Ionicons name="call" size={28} color={colors.white} />
            </Pressable>
          )}
        </View>
      </View>
    </LinearGradient>
  );
}

function ControlButton({
  icon,
  label,
  active,
  onPress,
}: {
  icon: any;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.controlWrap}>
      <Pressable
        onPress={onPress}
        style={[styles.controlBtn, active && { backgroundColor: colors.violet[600] }]}
      >
        <Ionicons name={icon} size={22} color={colors.white} />
      </Pressable>
      <AppText variant="caption" color={colors.textSecondary}>{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5,5,10,0.72)',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    paddingHorizontal: 24,
  },
  name: {
    fontSize: 30,
  },
  controls: {
    marginTop: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  incomingActions: {
    flexDirection: 'row',
    gap: 60,
  },
  endBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.red,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '135deg' }],
    ...shadows.glowBlush,
  },
  controlWrap: {
    alignItems: 'center',
    gap: 6,
  },
  controlBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceGlassStrong,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
