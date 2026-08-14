import React from 'react';
import { View, StyleSheet, Pressable, useWindowDimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '../ui/AppText';
import { Badge } from '../ui/Badge';
import { PublicUserSummary } from '../../types/user';
import { colors, radius, shadows } from '../../constants/theme';
import { distanceLabel } from '../../core/utils/distance';

interface ProfileCardProps {
  user: PublicUserSummary;
  onPress: () => void;
  matchScore?: number;
  likesYou?: boolean;
}

export function ProfileCard({ user, onPress, matchScore, likesYou }: ProfileCardProps) {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 2;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [pressed && { transform: [{ scale: 0.96 }] }]}
    >
      <View style={[styles.card, { width: cardWidth }]}>
        <FastImage
          source={{ uri: user.photos?.[0] }}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        <LinearGradient colors={['rgba(5,5,10,0)', 'rgba(5,5,10,0.95)']} style={styles.gradient} />
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <AppText variant="label" numberOfLines={1} style={styles.name}>
              {user.displayName}, {user.age}
            </AppText>
          </View>
          <View style={styles.metaRow}>
            {user.distanceKm !== null && user.distanceKm !== undefined ? (
              <View style={styles.meta}>
                <Ionicons name="location" size={10} color={colors.textSecondary} />
                <AppText variant="caption" color={colors.textSecondary} numberOfLines={1}>
                  {distanceLabel(user.distanceKm)}
                </AppText>
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.badges}>
          {user.verified ? <Badge kind="verified" size="sm" /> : null}
          {user.premium ? <Badge kind="premium" size="sm" /> : null}
          {user.online ? <Badge kind="super" size="sm" label="Online" /> : null}
        </View>
        {matchScore !== undefined ? (
          <View style={styles.score}>
            <AppText variant="caption" color="#FFD76A">{matchScore}%</AppText>
          </View>
        ) : null}
        {likesYou ? (
          <View style={styles.likesYou}>
            <Ionicons name="heart" size={10} color={colors.white} />
            <AppText variant="caption" color={colors.white}>Likes you</AppText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 250,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.ink[800],
    ...shadows.soft,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '55%',
  },
  info: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: {
    flex: 1,
    color: colors.white,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  badges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  score: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  likesYou: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,62,165,0.85)',
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
});
