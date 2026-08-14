import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Keyboard, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { useMediaPicker } from '../../hooks/useMediaPicker';
import { colors, radius } from '../../constants/theme';

const EMOJIS = [
  '😀', '😂', '😍', '😘', '😎', '🤩', '🥰', '😊', '😅', '🤔',
  '😢', '😭', '😡', '🥳', '😇', '🙃', '😜', '🤗', '😳', '🤯',
  '❤️', '💜', '💙', '💚', '🧡', '💛', '🖤', '💔', '💯', '🔥',
  '✨', '💫', '🎉', '🎊', '👏', '🙏', '👍', '👎', '👋', '🤝',
  '🌹', '🌸', '🌙', '⭐', '☀️', '🌈', '🍕', '🍣', '🍦', '☕',
];

const GIFS = [
  'https://media.giphy.com/media/l0HlNaQ6gWfllcjDO/giphy.gif',
  'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif',
  'https://media.giphy.com/media/TLJZWMWU2jOdy/giphy.gif',
  'https://media.giphy.com/media/26gssK8bvvv2tGvji/giphy.gif',
];

interface ChatInputBarProps {
  onSendText: (text: string) => void;
  onSendImage: (uri: string) => void;
  onSendVideo: (uri: string) => void;
  onSendVoice: (uri: string, durationMs: number) => void;
  onSendGif: (url: string) => void;
  onSendEmoji: (emoji: string) => void;
  onTyping: (typing: boolean) => void;
}

export function ChatInputBar({
  onSendText,
  onSendImage,
  onSendVideo,
  onSendVoice,
  onSendGif,
  onSendEmoji,
  onTyping,
}: ChatInputBarProps) {
  const [text, setText] = useState('');
  const [panel, setPanel] = useState<'emoji' | 'gif' | 'voice' | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingSec, setRecordingSec] = useState(0);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const { pickImage, pickVideo } = useMediaPicker();

  useEffect(() => {
    Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true }).catch(() => {});
    return () => {
      Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
    };
  }, []);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText('');
    setPanel(null);
  };

  const togglePanel = (name: 'emoji' | 'gif') => {
    Keyboard.dismiss();
    setPanel((p) => (p === name ? null : name));
  };

  const startRecording = async () => {
    try {
      setPanel(null);
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) return;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = recording;
      setRecording(true);
      setRecordingSec(0);
    } catch {
      setRecording(false);
    }
  };

  const stopRecording = async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    try {
      const status = await rec.stopAndUnloadAsync();
      setRecording(false);
      const uri = rec.getURI();
      if (uri && status.durationMillis > 500) {
        onSendVoice(uri, status.durationMillis);
      }
    } catch {
      setRecording(false);
    } finally {
      recordingRef.current = null;
    }
  };

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => setRecordingSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [recording]);

  const pickAndSendImage = async () => {
    const asset = await pickImage();
    if (asset) onSendImage(asset.uri);
  };

  const pickAndSendVideo = async () => {
    const asset = await pickVideo();
    if (asset) onSendVideo(asset.uri);
  };

  return (
    <View style={styles.container}>
      {panel === 'emoji' ? (
        <View style={styles.panel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
            {EMOJIS.map((e) => (
              <Pressable key={e} onPress={() => onSendEmoji(e)} style={styles.emojiBtn}>
                <AppText style={styles.emojiText}>{e}</AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {panel === 'gif' ? (
        <View style={styles.panel}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.emojiRow}>
            {GIFS.map((url) => (
              <Pressable key={url} onPress={() => { onSendGif(url); setPanel(null); }} style={styles.gifBtn}>
                <AppText variant="caption" color={colors.white}>GIF</AppText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {recording ? (
        <View style={styles.recordingRow}>
          <Ionicons name="mic" size={20} color={colors.red} />
          <AppText variant="label" color={colors.red}>Recording {recordingSec}s...</AppText>
        </View>
      ) : null}

      <View style={styles.inputRow}>
        <Pressable onPress={() => togglePanel('emoji')} style={styles.iconBtn} hitSlop={6}>
          <Ionicons name="happy-outline" size={24} color={panel === 'emoji' ? colors.violet[300] : colors.textSecondary} />
        </Pressable>
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Message..."
            placeholderTextColor={colors.textTertiary}
            value={text}
            onChangeText={(t) => {
              setText(t);
              onTyping(t.length > 0);
            }}
            multiline
          />
        </View>
        {text.length > 0 ? (
          <Pressable onPress={send} style={styles.sendBtn} hitSlop={6}>
            <Ionicons name="send" size={18} color={colors.white} />
          </Pressable>
        ) : (
          <>
            <Pressable onPress={pickAndSendImage} style={styles.iconBtn} hitSlop={6}>
              <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
            </Pressable>
            <Pressable onPress={pickAndSendVideo} style={styles.iconBtn} hitSlop={6}>
              <Ionicons name="videocam-outline" size={24} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              onPressIn={startRecording}
              onPressOut={stopRecording}
              style={[styles.iconBtn, recording && styles.recordingBtn]}
              hitSlop={6}
            >
              <Ionicons name="mic-outline" size={24} color={recording ? colors.red : colors.textSecondary} />
            </Pressable>
            <Pressable onPress={() => togglePanel('gif')} style={styles.iconBtn} hitSlop={6}>
              <Ionicons name="gift-outline" size={24} color={colors.textSecondary} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
    backgroundColor: colors.ink[900],
    paddingBottom: 8,
  },
  panel: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass,
  },
  emojiRow: {
    paddingHorizontal: 12,
    gap: 4,
  },
  emojiBtn: {
    padding: 6,
  },
  emojiText: {
    fontSize: 26,
    lineHeight: 32,
  },
  gifBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.violet[600],
    marginRight: 8,
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingBtn: {
    backgroundColor: 'rgba(255,91,121,0.15)',
    borderRadius: 18,
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
});
