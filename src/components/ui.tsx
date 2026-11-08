import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import type { ComponentProps, ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/theme';

export const tap = () => Haptics.selectionAsync().catch(() => {});
export const thud = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
export const success = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

/* ---------- Layout ---------- */

export function Screen({
  children,
  scroll = true,
  edges = ['top'],
  footer,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { flex: 1 }, contentStyle]}>{children}</View>
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

export function Row({ children, style, gap = space.sm }: { children: ReactNode; style?: StyleProp<ViewStyle>; gap?: number }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{children}</View>;
}

/* ---------- Text ---------- */

type TxtProps = TextProps & { color?: string; size?: number; style?: StyleProp<TextStyle> };

/** Big condensed uppercase poster type */
export function Display({ children, color = colors.text, size = 34, style, ...rest }: TxtProps) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: fonts.display, fontSize: size, lineHeight: size * 1.08, color, textTransform: 'uppercase' }, style]}
    >
      {children}
    </Text>
  );
}

export function Body({
  children,
  color = colors.text,
  size = 15,
  weight = 'regular',
  style,
  ...rest
}: TxtProps & { weight?: 'regular' | 'semi' | 'bold' }) {
  const family = weight === 'bold' ? fonts.bodyBold : weight === 'semi' ? fonts.bodySemi : fonts.body;
  return (
    <Text {...rest} style={[{ fontFamily: family, fontSize: size, lineHeight: size * 1.4, color }, style]}>
      {children}
    </Text>
  );
}

export function Label({ children, color = colors.muted, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[{ fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase', color }, style]}>
      {children}
    </Text>
  );
}

/* ---------- Controls ---------- */

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  style,
  small,
}: {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'dark' | 'danger';
  icon?: ComponentProps<typeof Ionicons>['name'];
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const bg =
    variant === 'primary' ? colors.accent : variant === 'dark' ? colors.surfaceHigh : 'transparent';
  const fg =
    variant === 'primary' ? colors.onAccent : variant === 'danger' ? colors.danger : colors.text;
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={({ pressed }) => [
        styles.button,
        small && styles.buttonSmall,
        { backgroundColor: bg, opacity: disabled ? 0.35 : pressed ? 0.8 : 1 },
        variant === 'ghost' && { borderWidth: 1.5, borderColor: colors.border },
        variant === 'danger' && { borderWidth: 1.5, borderColor: colors.danger },
        { transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={small ? 16 : 20} color={fg} /> : null}
      <Display size={small ? 15 : 19} color={fg}>
        {title}
      </Display>
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  color = colors.text,
  size = 22,
  label,
  style,
}: {
  name: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  color?: string;
  size?: number;
  label: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={10}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.6 : 1 }, style]}
    >
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

export function Card({
  children,
  style,
  onPress,
  accent,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: PressableProps['onPress'];
  accent?: boolean;
}) {
  const base = [styles.card, accent && { backgroundColor: colors.accent }, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={(e) => {
        tap();
        onPress(e);
      }}
      style={({ pressed }) => [base, { opacity: pressed ? 0.85 : 1, transform: [{ scale: pressed ? 0.985 : 1 }] }]}
    >
      {children}
    </Pressable>
  );
}

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress?.();
      }}
      style={[styles.chip, selected && { backgroundColor: colors.accent, borderColor: colors.accent }]}
    >
      <Body weight="semi" size={14} color={selected ? colors.onAccent : colors.text}>
        {label}
      </Body>
    </Pressable>
  );
}

/** Big tappable option row used in onboarding */
export function Option({
  label,
  hint,
  selected,
  onPress,
}: {
  label: string;
  hint?: string;
  selected?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        styles.option,
        selected && { borderColor: colors.accent, backgroundColor: '#1a1f0a' },
        pressed && { opacity: 0.85 },
      ]}
    >
      <View style={{ flex: 1 }}>
        <Display size={22} color={selected ? colors.accent : colors.text}>
          {label}
        </Display>
        {hint ? (
          <Body size={13} color={colors.muted}>
            {hint}
          </Body>
        ) : null}
      </View>
      <View style={[styles.radio, selected && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
        {selected ? <Ionicons name="checkmark" size={16} color={colors.onAccent} /> : null}
      </View>
    </Pressable>
  );
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 999,
  suffix,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  suffix?: string;
  label?: string;
}) {
  const clamp = (v: number) => Math.min(max, Math.max(min, Math.round(v * 100) / 100));
  return (
    <View style={{ alignItems: 'center', gap: 4 }}>
      {label ? <Label>{label}</Label> : null}
      <View style={styles.stepper}>
        <IconButton name="remove" label={`Decrease ${label ?? ''}`} onPress={() => onChange(clamp(value - step))} />
        <View style={{ minWidth: 64, alignItems: 'center' }}>
          <Display size={28}>
            {value}
            {suffix ? <Display size={14} color={colors.muted}>{` ${suffix}`}</Display> : null}
          </Display>
        </View>
        <IconButton name="add" label={`Increase ${label ?? ''}`} onPress={() => onChange(clamp(value + step))} />
      </View>
    </View>
  );
}

export function ProgressBars({ total, done, current }: { total: number; done: number; current?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6 }}>
      {Array.from({ length: total }, (_, i) => (
        <View
          key={i}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            backgroundColor: i < done ? colors.accent : i === current ? '#5b6b1a' : colors.surfaceHigh,
          }}
        />
      ))}
    </View>
  );
}

export function Stat({ value, label, accent }: { value: string | number; label: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Display size={30} color={accent ? colors.accent : colors.text}>
        {value}
      </Display>
      <Label>{label}</Label>
    </View>
  );
}

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: space.xxl, gap: space.sm }}>
      <Display size={26} style={{ textAlign: 'center' }}>
        {title}
      </Display>
      <Body color={colors.muted} style={{ textAlign: 'center', maxWidth: 280 }}>
        {body}
      </Body>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: space.lg, paddingBottom: space.xxl * 2, gap: space.lg },
  footer: { paddingHorizontal: space.lg, paddingTop: space.sm, paddingBottom: space.lg, backgroundColor: colors.bg },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
    paddingVertical: 15,
    paddingHorizontal: space.xl,
    borderRadius: radius.pill,
  },
  buttonSmall: { paddingVertical: 9, paddingHorizontal: space.lg },
  iconButton: { padding: 8, borderRadius: radius.pill },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: space.lg, gap: space.sm },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    padding: space.lg,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  radio: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.faint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceHigh,
    borderRadius: radius.pill,
    paddingHorizontal: 4,
  },
});
