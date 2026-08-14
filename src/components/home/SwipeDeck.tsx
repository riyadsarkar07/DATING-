import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SwipeCard } from './SwipeCard';
import { DiscoveryCandidate } from '../../types/filters';
import { SwipeDirection } from '../../types/enums';

export interface SwipeDeckHandle {
  trigger: (direction: SwipeDirection) => void;
}

interface SwipeDeckProps {
  candidates: DiscoveryCandidate[];
  onSwipe: (direction: SwipeDirection) => void;
}

export const SwipeDeck = forwardRef<SwipeDeckHandle, SwipeDeckProps>(
  ({ candidates, onSwipe }, ref) => {
    const [forceSwipe, setForceSwipe] = useState<{ direction: SwipeDirection; tick: number } | null>(null);

    useImperativeHandle(ref, () => ({
      trigger: (direction: SwipeDirection) => setForceSwipe({ direction, tick: Date.now() }),
    }));

    const handleSwipe = (direction: SwipeDirection) => {
      setForceSwipe(null);
      onSwipe(direction);
    };

    return (
      <View style={styles.deck}>
        {candidates.slice(0, 3).map((c, i) => (
          <SwipeCard
            key={c.uid}
            candidate={c}
            stackIndex={i}
            isTop={i === 0}
            forceSwipe={i === 0 ? forceSwipe : null}
            onSwipe={handleSwipe}
          />
        ))}
      </View>
    );
  },
);

SwipeDeck.displayName = 'SwipeDeck';

const styles = StyleSheet.create({
  deck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
