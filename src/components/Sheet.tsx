import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Animated, Easing, KeyboardAvoidingView, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, space } from '@/theme';
import { Body, Display } from './ui';

/** Bottom sheet for short edits. Slides up over a dimmed backdrop; tap outside or Back closes it. */
export function Sheet({
  visible,
  onClose,
  title,
  hint,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [rise] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (!visible) return;
    rise.setValue(0);
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .catch(() => false)
      .then((reduce) => {
        if (cancelled) return;
        Animated.timing(rise, {
          toValue: 1,
          duration: reduce ? 0 : 280,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }).start();
      });
    return () => {
      cancelled = true;
    };
  }, [visible, rise]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <KeyboardAvoidingView behavior="padding" style={styles.root}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close" />
        <Animated.View
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + space.lg },
            { transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [80, 0] }) }] },
          ]}
        >
          <View style={{ gap: 4 }}>
            <Display size={30}>{title}</Display>
            {hint ? (
              <Body size={14} color={colors.muted}>
                {hint}
              </Body>
            ) : null}
          </View>
          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.72)' },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg + 8,
    borderTopRightRadius: radius.lg + 8,
    paddingHorizontal: space.lg,
    paddingTop: space.xl,
    gap: space.lg,
    maxHeight: '90%',
  },
});
