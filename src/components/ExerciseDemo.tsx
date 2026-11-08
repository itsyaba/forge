import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { IMAGE_MIRRORS, imageUrl } from '@/data/catalog';
import type { Exercise } from '@/lib/types';
import { colors, radius } from '@/theme';
import { Body, Label } from './ui';

/** Warm the disk cache so demos are ready by the time the user reaches them. */
export function prefetchExerciseImages(exercises: Exercise[]) {
  const urls = exercises.flatMap((e) => e.images.slice(0, 2).map((p) => imageUrl(p)));
  if (urls.length) Image.prefetch(urls, 'memory-disk').catch(() => {});
}

/**
 * "GIF" of an exercise: loops between the start and end photos with a crossfade.
 * Shows a spinner while loading, falls back to a mirror on error, and offers retry.
 */
export function ExerciseDemo(props: { exercise: Exercise; style?: StyleProp<ViewStyle>; paused?: boolean }) {
  const [attempt, setAttempt] = useState(0);
  // remount on a new exercise or a retry so load state starts fresh
  return <Demo key={`${props.exercise.id}:${attempt}`} {...props} onRetry={() => setAttempt((a) => a + 1)} />;
}

function Demo({
  exercise,
  style,
  paused,
  onRetry,
}: {
  exercise: Exercise;
  style?: StyleProp<ViewStyle>;
  paused?: boolean;
  onRetry: () => void;
}) {
  const [fade] = useState(() => new Animated.Value(0));
  const [first, second] = exercise.images;
  const [mirror, setMirror] = useState([0, 0]);
  const [loaded, setLoaded] = useState([false, false]);
  const failed = mirror[0] >= IMAGE_MIRRORS;

  const onLoad = (i: number) => () => setLoaded((l) => l.map((v, j) => (j === i ? true : v)));
  const onError = (i: number) => () => setMirror((m) => m.map((v, j) => (j === i ? v + 1 : v)));

  const animate = !!second && loaded[0] && loaded[1] && !paused;
  useEffect(() => {
    if (!animate) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(700),
        Animated.timing(fade, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.delay(700),
        Animated.timing(fade, { toValue: 0, duration: 350, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => {
      loop.stop();
      fade.setValue(0);
    };
  }, [fade, animate]);

  return (
    <View style={[styles.box, style]}>
      {!failed ? (
        <Image
          source={imageUrl(first, mirror[0])}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="disk"
          transition={200}
          onLoad={onLoad(0)}
          onError={onError(0)}
        />
      ) : null}
      {second && mirror[1] < IMAGE_MIRRORS ? (
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fade }]} pointerEvents="none">
          <Image
            source={imageUrl(second, mirror[1])}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            cachePolicy="disk"
            onLoad={onLoad(1)}
            onError={onError(1)}
          />
        </Animated.View>
      ) : null}

      {failed ? (
        <Pressable accessibilityRole="button" onPress={onRetry} style={styles.overlay}>
          <Ionicons name="cloud-offline-outline" size={32} color={colors.muted} />
          <Body weight="semi">Couldn’t load the demo</Body>
          <Label color={colors.accent}>Tap to retry</Label>
        </Pressable>
      ) : !loaded[0] ? (
        <View style={styles.overlay} pointerEvents="none">
          <ActivityIndicator color={colors.accent} size="large" />
          <Label>Loading demo…</Label>
        </View>
      ) : null}
    </View>
  );
}

export function ExerciseThumb({ exercise, size = 52 }: { exercise: Exercise; size?: number }) {
  const [mirror, setMirror] = useState(0);
  return (
    <Image
      source={imageUrl(exercise.images[0], mirror)}
      style={{ width: size, height: size, borderRadius: radius.sm, backgroundColor: colors.surfaceHigh }}
      contentFit="cover"
      cachePolicy="disk"
      recyclingKey={exercise.id}
      transition={100}
      onError={() => setMirror((m) => (m + 1 < IMAGE_MIRRORS ? m + 1 : m))}
    />
  );
}

const styles = StyleSheet.create({
  box: {
    aspectRatio: 4 / 3,
    width: '100%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceHigh,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
});
