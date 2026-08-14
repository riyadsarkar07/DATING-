import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Path, Rect, Defs, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '../../components/ui/AppText';
import { GradientButton } from '../../components/ui/GradientButton';
import { onboardingSlides } from '../../constants/onboarding';
import { useAppStore } from '../../store/app.store';
import { colors } from '../../constants/theme';

const ILLUSTRATION_SIZE = 300;

export function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const navigation = useNavigation();
  const markOnboardingDone = useAppStore((s) => s.markOnboardingDone);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);
  const progress = useSharedValue(0);

  const goNext = () => {
    if (index < onboardingSlides.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      finish();
    }
  };

  const skip = async () => {
    await markOnboardingDone();
    (navigation as any).reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  const finish = async () => {
    await markOnboardingDone();
    (navigation as any).reset({ index: 0, routes: [{ name: 'Auth' }] });
  };

  const slide = onboardingSlides[index];

  return (
    <LinearGradient colors={['#05050A', '#120820']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <AppText variant="heading" style={styles.logoText}>
            Spark<AppText variant="heading" color={colors.blush[500]}>X</AppText>
          </AppText>
          <Pressable onPress={skip} hitSlop={12}>
            <AppText variant="label" color={colors.textSecondary}>
              Skip
            </AppText>
          </Pressable>
        </View>

        <FlatList
          ref={listRef}
          data={onboardingSlides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.key}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(i);
            progress.value = withTiming(i);
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <OnboardingIllustration kind={item.illustration} accent={item.accent} />
              <AppText variant="title" centered style={styles.slideTitle}>
                {item.title}
              </AppText>
              <AppText variant="body" color={colors.textSecondary} centered style={styles.slideSubtitle}>
                {item.subtitle}
              </AppText>
            </View>
          )}
        />

        <View style={styles.footer}>
          <View style={styles.dotsRow}>
            {onboardingSlides.map((s, i) => {
              const isActive = i === index;
              return (
                <Animated.View
                  key={s.key}
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                    isActive && { width: 28 },
                  ]}
                />
              );
            })}
          </View>
          <GradientButton
            title={index === onboardingSlides.length - 1 ? 'Get Started' : 'Continue'}
            onPress={goNext}
            style={styles.continue}
          />
          {index < onboardingSlides.length - 1 ? (
            <Pressable onPress={finish} hitSlop={10}>
              <AppText variant="label" color={colors.textTertiary} centered style={styles.skipBottom}>
                Skip all
              </AppText>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function OnboardingIllustration({
  kind,
  accent,
}: {
  kind: string;
  accent: [string, string];
}) {
  const [c1, c2] = accent;
  return (
    <View style={styles.illustration}>
      <Svg width={ILLUSTRATION_SIZE} height={ILLUSTRATION_SIZE} viewBox="0 0 300 300">
        <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c1} />
            <Stop offset="1" stopColor={c2} />
          </SvgLinearGradient>
        </Defs>
        <Circle cx="150" cy="150" r="130" fill="none" stroke="url(#grad)" strokeWidth="1.5" opacity="0.35" />
        <Circle cx="150" cy="150" r="95" fill="none" stroke="url(#grad)" strokeWidth="1" opacity="0.25" />

        {kind === 'spark' ? (
          <>
            <Circle cx="150" cy="150" r="55" fill="url(#grad)" opacity="0.9" />
            <Circle cx="150" cy="150" r="38" fill="#0A0A14" />
            <Path d="M150 118 L163 148 L150 182 L137 148 Z" fill="url(#grad)" />
            <Circle cx="205" cy="95" r="10" fill={c1} />
            <Circle cx="85" cy="200" r="8" fill={c2} />
            <Circle cx="220" cy="190" r="6" fill="#FFC53D" />
          </>
        ) : kind === 'match' ? (
          <>
            <Path
              d="M150 195 C 130 175, 105 155, 105 130 A 40 40 0 0 1 150 105 A 40 40 0 0 1 195 130 C 195 155, 170 175, 150 195 Z"
              fill="url(#grad)"
            />
            <Circle cx="120" cy="125" r="6" fill="#0A0A14" />
            <Circle cx="180" cy="125" r="6" fill="#0A0A14" />
            <Path d="M 130 160 Q 150 180 170 160" stroke="#0A0A14" strokeWidth="5" strokeLinecap="round" fill="none" />
            <Circle cx="60" cy="90" r="9" fill={c1} />
            <Circle cx="245" cy="210" r="7" fill={c2} />
          </>
        ) : (
          <>
            <Rect x="100" y="95" width="100" height="120" rx="22" fill="url(#grad)" opacity="0.9" />
            <Rect x="112" y="110" width="76" height="12" rx="6" fill="#0A0A14" opacity="0.8" />
            <Rect x="112" y="132" width="50" height="10" rx="5" fill="#0A0A14" opacity="0.8" />
            <Circle cx="150" cy="176" r="20" fill="#0A0A14" opacity="0.85" />
            <Circle cx="150" cy="176" r="9" fill={c2} />
            <Circle cx="70" cy="150" r="8" fill="#FFC53D" />
            <Circle cx="235" cy="140" r="8" fill={c1} />
            <Circle cx="150" cy="60" r="10" fill={c2} />
          </>
        )}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  logoText: {
    letterSpacing: 1,
  },
  slide: {
    alignItems: 'center',
    paddingHorizontal: 28,
    justifyContent: 'center',
  },
  illustration: {
    marginBottom: 20,
  },
  slideTitle: {
    marginBottom: 14,
  },
  slideSubtitle: {
    maxWidth: 300,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: '#FF3EA5',
  },
  dotInactive: {
    width: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  continue: {
    marginBottom: 16,
  },
  skipBottom: {
    letterSpacing: 1,
  },
});
