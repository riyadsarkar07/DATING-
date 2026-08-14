import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { ChatMessage } from '../../types/chat';
import { colors, radius } from '../../constants/theme';
import { formatTime } from '../../core/utils/date';

const { width: SCREEN_W } = Dimensions.get('window');

interface MessageBubbleProps {
  message: ChatMessage;
  isMine: boolean;
  onLongPress?: () => void;
  readReceiptsEnabled?: boolean;
}

export function MessageBubble({ message, isMine, onLongPress, readReceiptsEnabled }: MessageBubbleProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const bubble = isMine ? styles.mine : styles.theirs;

  const renderContent = () => {
    if (message.deleted) {
      return (
        <AppText variant="caption" color={colors.textTertiary} style={styles.deletedText}>
          Message deleted
        </AppText>
      );
    }
    switch (message.kind) {
      case 'system':
        return (
          <View style={styles.systemWrap}>
            <AppText variant="caption" color={colors.textTertiary} centered>
              {message.text}
            </AppText>
          </View>
        );
      case 'emoji':
        return <AppText style={styles.emoji}>{message.text}</AppText>;
      case 'image':
        return imageFailed ? (
          <View style={[styles.media, styles.mediaFail]}>
            <Ionicons name="image-outline" size={32} color={colors.textTertiary} />
          </View>
        ) : (
          <FastImage
            source={{ uri: message.mediaUrl }}
            style={[styles.media, { width: Math.min(SCREEN_W * 0.6, message.mediaWidth || 240) }]}
            resizeMode={FastImage.resizeMode.cover}
            onError={() => setImageFailed(true)}
          />
        );
      case 'video':
        return (
          <View style={[styles.media, styles.videoMedia]}>
            <Ionicons name="videocam" size={32} color={colors.textSecondary} />
            <View style={styles.playBtn}>
              <Ionicons name="play" size={22} color={colors.white} />
            </View>
          </View>
        );
      case 'voice':
        return (
          <View style={styles.voiceWrap}>
            <Ionicons name="mic" size={18} color={colors.violet[300]} />
            <View style={styles.voiceBar}>
              <View style={[styles.voiceFill, { width: `${Math.min(100, (message.durationMs || 2000) / 20000) * 100}%` }]} />
            </View>
            <AppText variant="caption" color={colors.textSecondary}>
              {formatDuration(message.durationMs || 0)}
            </AppText>
          </View>
        );
      case 'gif':
        return imageFailed ? (
          <View style={[styles.media, styles.mediaFail]}>
            <Ionicons name="gift-outline" size={32} color={colors.textTertiary} />
          </View>
        ) : (
          <FastImage source={{ uri: message.mediaUrl }} style={styles.gif} onError={() => setImageFailed(true)} />
        );
      case 'text':
      default:
        return (
          <AppText variant="body" color={isMine ? colors.white : colors.offWhite}>
            {message.text}
          </AppText>
        );
    }
  };

  if (message.kind === 'system') {
    return <View style={styles.systemRow}>{renderContent()}</View>;
  }

  return (
    <Pressable onLongPress={onLongPress} style={[styles.row, isMine && styles.rowMine]}>
      {message.replyTo ? (
        <View style={[styles.replyBox, isMine ? styles.replyBoxMine : styles.replyBoxTheirs]}>
          <AppText variant="caption" color={colors.violet[300]} numberOfLines={1}>
            Replying to {message.replyTo.senderId === 'system' ? 'system' : 'message'}
          </AppText>
          <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
            {message.replyTo.text || 'Attachment'}
          </AppText>
        </View>
      ) : null}
      <View style={[styles.bubble, bubble]}>{renderContent()}</View>
      <View style={styles.meta}>
        {message.deleted ? null : (
          <>
            {isMine && readReceiptsEnabled ? (
              message.readAt ? (
                <Ionicons name="checkmark-done" size={14} color="#00D1FF" />
              ) : (
                <Ionicons name="checkmark" size={14} color={colors.textTertiary} />
              )
            ) : null}
            <AppText variant="caption" color={colors.textTertiary} style={styles.time}>
              {formatTime(message.createdAt)}
            </AppText>
          </>
        )}
      </View>
    </Pressable>
  );
}

function formatDuration(ms: number): string {
  const sec = Math.round(ms / 1000);
  return `${Math.floor(sec / 60)}:${`${sec % 60}`.padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    marginVertical: 4,
    maxWidth: '80%',
  },
  rowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  bubble: {
    borderRadius: radius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
  },
  mine: {
    backgroundColor: colors.violet[600],
    borderColor: 'rgba(255,255,255,0.12)',
    borderBottomRightRadius: 6,
  },
  theirs: {
    backgroundColor: colors.surfaceGlassStrong,
    borderColor: colors.borderGlass,
    borderBottomLeftRadius: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
    paddingHorizontal: 4,
  },
  time: {
    fontSize: 10,
  },
  systemRow: {
    alignItems: 'center',
    marginVertical: 12,
  },
  systemWrap: {
    alignSelf: 'center',
    backgroundColor: colors.surfaceGlass,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  emoji: {
    fontSize: 44,
    lineHeight: 56,
  },
  media: {
    height: 220,
    borderRadius: radius.md,
    backgroundColor: colors.ink[700],
  },
  mediaFail: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoMedia: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoThumb: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.md,
  },
  deletedText: {
    fontStyle: 'italic',
  },
  playBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gif: {
    width: 160,
    height: 120,
    borderRadius: radius.md,
  },
  voiceWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 150,
  },
  voiceBar: {
    flex: 1,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  voiceFill: {
    height: '100%',
    backgroundColor: colors.violet[300],
  },
  replyBox: {
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 6,
    maxWidth: 220,
  },
  replyBoxMine: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  replyBoxTheirs: {
    backgroundColor: colors.ink[700],
  },
});
