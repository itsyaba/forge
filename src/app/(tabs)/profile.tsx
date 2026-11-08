import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';
import { Sheet } from '@/components/Sheet';
import { Body, Button, Display, Option, Row, Screen, success, tap } from '@/components/ui';
import { SPLIT_BY_ID } from '@/data/splits';
import { WEEKDAY_NAMES } from '@/lib/dates';
import { weeklyStreak } from '@/lib/stats';
import type { Experience, Gender, Goal, HomeEquipment, Unit, Weekday } from '@/lib/types';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { useSession } from '@/store/session';
import { colors, fonts, radius, space } from '@/theme';

const GOALS: { id: Goal; label: string; hint: string }[] = [
  { id: 'muscle', label: 'Build muscle', hint: 'Look bigger and more toned' },
  { id: 'strength', label: 'Get stronger', hint: 'Lift heavier things' },
  { id: 'fatloss', label: 'Lose fat', hint: 'Faster pace, shorter rests' },
  { id: 'general', label: 'General fitness', hint: 'Feel good, move better' },
];
const EXPERIENCE: {
  id: Experience;
  label: string;
  hint: string;
  short: string;
}[] = [
  {
    id: 'never',
    label: 'Never',
    hint: 'Totally new. We’ll keep it simple.',
    short: 'New to this',
  },
  {
    id: 'some',
    label: 'A little',
    hint: 'Tried it, never stuck with it.',
    short: 'Some experience',
  },
  {
    id: 'regular',
    label: 'Regularly',
    hint: 'I know my way around.',
    short: 'Trains regularly',
  },
];
const GENDERS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
  { id: 'other', label: 'Prefer not to say' },
];
const EQUIPMENT: { id: HomeEquipment; label: string }[] = [
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'bands', label: 'Resistance bands' },
  { id: 'kettlebell', label: 'Kettlebell' },
  { id: 'pullupbar', label: 'Pull-up bar' },
];

type Editing = 'goal' | 'experience' | 'days' | 'location' | 'equipment' | 'name' | 'gender' | 'weight' | 'units' | null;

const onAccentSoft = 'rgba(11,11,11,0.62)';

export default function ProfileTab() {
  const p = useProfile((s) => s.profile)!;
  const update = useProfile((s) => s.update);
  const workouts = useHistory((s) => s.workouts);
  const split = p.activeSplitId ? SPLIT_BY_ID[p.activeSplitId] : null;
  const streak = weeklyStreak(workouts, Math.max(1, p.days.length));

  const [editing, setEditing] = useState<Editing>(null);
  const close = () => setEditing(null);
  const choose = (patch: Parameters<typeof update>[0]) => {
    update(patch);
    close();
  };

  const toggleDay = (d: Weekday) => {
    const days = p.days.includes(d) ? p.days.filter((x) => x !== d) : [...p.days, d].sort((a, b) => a - b);
    if (days.length) update({ days });
  };
  const toggleEquip = (e: HomeEquipment) =>
    update({
      equipment: p.equipment.includes(e) ? p.equipment.filter((x) => x !== e) : [...p.equipment, e],
    });

  const reset = () =>
    Alert.alert('Reset everything?', 'This deletes your profile and all workout history. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete all',
        style: 'destructive',
        onPress: () => {
          useSession.setState({ draft: null, active: null });
          useHistory.getState().reset();
          useProfile.getState().reset();
        },
      },
    ]);

  const goal = GOALS.find((g) => g.id === p.goal)!;
  const exp = EXPERIENCE.find((e) => e.id === p.experience)!;
  const daysText = p.days.length === 7 ? 'Every day' : p.days.map((d) => WEEKDAY_NAMES[d].slice(0, 2)).join(' ');
  const equipText = p.equipment.length
    ? EQUIPMENT.filter((e) => p.equipment.includes(e.id))
        .map((e) => e.label)
        .join(', ')
    : 'None yet';
  const record =
    workouts.length === 0
      ? 'No workouts yet. Start your first one'
      : `${workouts.length} workout${workouts.length === 1 ? '' : 's'} logged${streak.current ? ` · ${streak.current}-week streak` : ''}`;

  return (
    <Screen>
      {/* ── Athlete card */}
      <View
        style={{
          backgroundColor: colors.accent,
          borderRadius: radius.lg,
          padding: space.xl,
          gap: space.lg,
        }}
      >
        <Row gap={space.lg}>
          <View
            style={{
              width: 68,
              height: 68,
              borderRadius: radius.md,
              backgroundColor: colors.onAccent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Display size={40} color={colors.accent} style={{ lineHeight: 46 }}>
              {p.name.trim().charAt(0) || 'F'}
            </Display>
          </View>
          <View style={{ flex: 1 }}>
            <Display size={44} color={colors.onAccent} numberOfLines={1} adjustsFontSizeToFit style={{ lineHeight: 48 }}>
              {p.name}
            </Display>
            <Body size={14} weight="semi" color={onAccentSoft}>
              {exp.short} · {goal.label}
            </Body>
          </View>
        </Row>

        <Display size={22} color={colors.onAccent}>
          {p.bodyWeight} {p.unit} · {p.days.length} days a week · {p.location === 'gym' ? 'Gym' : 'Home'}
        </Display>

        {split ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Your split, ${split.name}. See the days`}
            onPress={() => {
              tap();
              router.push(`/split/${split.id}`);
            }}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: space.md,
              borderTopWidth: 1,
              borderTopColor: 'rgba(11,11,11,0.15)',
              paddingTop: space.lg,
              opacity: pressed ? 0.6 : 1,
            })}
          >
            <View style={{ flex: 1 }}>
              <Display size={26} color={colors.onAccent}>
                {split.name}
              </Display>
              <Body size={13} weight="semi" color={onAccentSoft}>
                Your split · {split.days.length} days · see the plan
              </Body>
            </View>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.onAccent,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-forward" size={20} color={colors.accent} />
            </View>
          </Pressable>
        ) : null}

        <Pressable
          disabled={workouts.length > 0}
          accessibilityRole={workouts.length ? undefined : 'button'}
          onPress={() => {
            tap();
            router.navigate('/');
          }}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: space.sm,
            minHeight: 48,
            borderTopWidth: 1,
            borderTopColor: 'rgba(11,11,11,0.15)',
            paddingTop: space.lg,
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Ionicons name="flame" size={18} color={colors.onAccent} />
          <Body weight="semi" color={colors.onAccent} style={{ flex: 1 }}>
            {record}
          </Body>
          {workouts.length === 0 ? <Ionicons name="arrow-forward" size={20} color={colors.onAccent} /> : null}
        </Pressable>
      </View>

      {/* ── Settings */}
      <Group title="Training">
        <SettingRow label="Goal" value={goal.label} onPress={() => setEditing('goal')} />
        <SettingRow label="Experience" value={exp.short} onPress={() => setEditing('experience')} />
        <SettingRow label="Workout days" value={daysText} onPress={() => setEditing('days')} />
        <SettingRow label="Where you train" value={p.location === 'gym' ? 'Gym' : 'Home'} onPress={() => setEditing('location')} />
        {p.location === 'home' ? <SettingRow label="Home equipment" value={equipText} onPress={() => setEditing('equipment')} /> : null}
      </Group>

      <Group title="You">
        <SettingRow label="Name" value={p.name} onPress={() => setEditing('name')} />
        <SettingRow label="Gender" value={GENDERS.find((g) => g.id === p.gender)?.label ?? '—'} onPress={() => setEditing('gender')} />
        <SettingRow label="Body weight" value={`${p.bodyWeight} ${p.unit}`} onPress={() => setEditing('weight')} />
        <SettingRow label="Units" value={p.unit} onPress={() => setEditing('units')} />
      </Group>

      <Group title="Data">
        <Pressable accessibilityRole="button" onPress={reset} style={({ pressed }) => [rowStyle, { opacity: pressed ? 0.6 : 1 }]}>
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
          <Body weight="semi" color={colors.danger} style={{ flex: 1 }}>
            Reset all data
          </Body>
        </Pressable>
        <Body size={12} color={colors.muted} style={{ marginTop: space.lg }}>
          Everything is stored on this phone only. Exercise data and photos: free-exercise-db (public domain).
        </Body>
      </Group>

      {/* ── Editors */}
      <Sheet visible={editing === 'goal'} onClose={close} title="Your goal" hint="This sets your recommended sets, reps and rest.">
        <View style={{ gap: space.sm }}>
          {GOALS.map((g) => (
            <Option key={g.id} label={g.label} hint={g.hint} selected={p.goal === g.id} onPress={() => choose({ goal: g.id })} />
          ))}
        </View>
      </Sheet>

      <Sheet visible={editing === 'experience'} onClose={close} title="Experience" hint="New lifters get fewer sets and longer rests.">
        <View style={{ gap: space.sm }}>
          {EXPERIENCE.map((e) => (
            <Option key={e.id} label={e.label} hint={e.hint} selected={p.experience === e.id} onPress={() => choose({ experience: e.id })} />
          ))}
        </View>
      </Sheet>

      <Sheet visible={editing === 'days'} onClose={close} title="Workout days" hint="Your weekly target and today’s workout follow these days.">
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {WEEKDAY_NAMES.map((d, i) => {
            const on = p.days.includes(i as Weekday);
            return (
              <Pressable
                key={d}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={d}
                onPress={() => {
                  tap();
                  toggleDay(i as Weekday);
                }}
                style={{
                  flex: 1,
                  height: 64,
                  borderRadius: radius.sm,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: on ? colors.accent : colors.surfaceHigh,
                }}
              >
                <Display size={18} color={on ? colors.onAccent : colors.muted}>
                  {d.slice(0, 2)}
                </Display>
              </Pressable>
            );
          })}
        </View>
        <Body size={14} color={colors.muted}>
          {p.days.length} day{p.days.length === 1 ? '' : 's'} a week. Keep at least one.
        </Body>
        <Button title="Done" onPress={close} />
      </Sheet>

      <Sheet visible={editing === 'location'} onClose={close} title="Where you train" hint="We only suggest exercises you can actually do there.">
        <View style={{ gap: space.sm }}>
          <Option
            label="At the gym"
            hint="Machines, cables, barbells and dumbbells"
            selected={p.location === 'gym'}
            onPress={() => choose({ location: 'gym' })}
          />
          <Option label="At home" hint="Bodyweight and whatever gear you have" selected={p.location === 'home'} onPress={() => choose({ location: 'home' })} />
        </View>
      </Sheet>

      <Sheet visible={editing === 'equipment'} onClose={close} title="Home equipment" hint="Pick everything you own. More gear unlocks more moves.">
        <View style={{ gap: space.sm }}>
          {EQUIPMENT.map((e) => (
            <Option key={e.id} label={e.label} selected={p.equipment.includes(e.id)} onPress={() => toggleEquip(e.id)} />
          ))}
        </View>
        <Button title="Done" onPress={close} />
      </Sheet>

      <Sheet visible={editing === 'gender'} onClose={close} title="Gender" hint="Only changes which split we suggest first.">
        <View style={{ gap: space.sm }}>
          {GENDERS.map((g) => (
            <Option key={g.id} label={g.label} selected={p.gender === g.id} onPress={() => choose({ gender: g.id })} />
          ))}
        </View>
      </Sheet>

      <Sheet visible={editing === 'units'} onClose={close} title="Units" hint="Switching doesn’t convert weights you’ve already logged.">
        <View style={{ gap: space.sm }}>
          {(['kg', 'lb'] as Unit[]).map((u) => (
            <Option key={u} label={u === 'kg' ? 'Kilograms (kg)' : 'Pounds (lb)'} selected={p.unit === u} onPress={() => choose({ unit: u })} />
          ))}
        </View>
      </Sheet>

      <TextSheet
        visible={editing === 'name'}
        onClose={close}
        title="Your name"
        initial={p.name}
        onSave={(v) => {
          if (v.trim()) choose({ name: v.trim() });
        }}
      />

      <TextSheet
        visible={editing === 'weight'}
        onClose={close}
        title="Body weight"
        hint="Also logged to your body-weight chart for today."
        initial={String(p.bodyWeight)}
        suffix={p.unit}
        numeric
        onSave={(v) => {
          const n = parseFloat(v.replace(',', '.'));
          if (!(n > 20 && n < 700)) return;
          useHistory.getState().logBodyWeight(n);
          choose({ bodyWeight: n });
          success();
        }}
      />
    </Screen>
  );
}

const rowStyle = {
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
  gap: space.md,
  minHeight: 60,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
};

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: space.lg }}>
      <Display size={28} style={{ marginBottom: space.xs }}>
        {title}
      </Display>
      {children}
    </View>
  );
}

function SettingRow({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [rowStyle, { opacity: pressed ? 0.6 : 1 }]}
    >
      <Body weight="semi" size={15} color={colors.muted}>
        {label}
      </Body>
      <Display size={20} numberOfLines={1} style={{ flex: 1, textAlign: 'right' }}>
        {value}
      </Display>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </Pressable>
  );
}

function TextSheet({
  visible,
  onClose,
  title,
  hint,
  initial,
  suffix,
  numeric,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  initial: string;
  suffix?: string;
  numeric?: boolean;
  onSave: (v: string) => void;
}) {
  const [text, setText] = useState(initial);
  // reset the field each time the sheet opens
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setText(initial);
  }
  return (
    <Sheet visible={visible} onClose={onClose} title={title} hint={hint}>
      <Row
        style={{
          backgroundColor: colors.surfaceHigh,
          borderRadius: radius.md,
          paddingHorizontal: space.lg,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          autoFocus
          selectTextOnFocus
          keyboardType={numeric ? 'decimal-pad' : 'default'}
          autoCapitalize="words"
          onSubmitEditing={() => onSave(text)}
          accessibilityLabel={title}
          cursorColor={colors.accent}
          selectionColor={colors.accent}
          selectionHandleColor={colors.accent}
          style={{
            flex: 1,
            minWidth: 0,
            fontFamily: fonts.display,
            fontSize: 32,
            color: colors.text,
            paddingVertical: space.md,
          }}
        />
        {suffix ? (
          <Display size={22} color={colors.muted}>
            {suffix}
          </Display>
        ) : null}
      </Row>
      <Button title="Save" onPress={() => onSave(text)} disabled={!text.trim()} />
    </Sheet>
  );
}
