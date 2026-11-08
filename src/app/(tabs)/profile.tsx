import { router } from 'expo-router';
import { Alert, View } from 'react-native';
import { Body, Button, Card, Chip, Display, Label, Row, Screen } from '@/components/ui';
import { SPLIT_BY_ID } from '@/data/splits';
import { WEEKDAY_NAMES } from '@/lib/dates';
import type { Experience, Goal, HomeEquipment, Weekday } from '@/lib/types';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { useSession } from '@/store/session';
import { colors, space } from '@/theme';

const GOALS: [Goal, string][] = [
  ['muscle', 'Build muscle'],
  ['strength', 'Get stronger'],
  ['fatloss', 'Lose fat'],
  ['general', 'General fitness'],
];
const EXPERIENCE: [Experience, string][] = [
  ['never', 'New'],
  ['some', 'A little'],
  ['regular', 'Regular'],
];
const EQUIPMENT: [HomeEquipment, string][] = [
  ['dumbbells', 'Dumbbells'],
  ['bands', 'Bands'],
  ['kettlebell', 'Kettlebell'],
  ['pullupbar', 'Pull-up bar'],
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: space.sm }}>
      <Label>{title}</Label>
      <Row style={{ flexWrap: 'wrap' }}>{children}</Row>
    </View>
  );
}

export default function ProfileTab() {
  const p = useProfile((s) => s.profile)!;
  const update = useProfile((s) => s.update);
  const split = p.activeSplitId ? SPLIT_BY_ID[p.activeSplitId] : null;

  const toggleDay = (d: Weekday) => {
    const days = p.days.includes(d) ? p.days.filter((x) => x !== d) : [...p.days, d].sort((a, b) => a - b);
    if (days.length) update({ days });
  };
  const toggleEquip = (e: HomeEquipment) =>
    update({ equipment: p.equipment.includes(e) ? p.equipment.filter((x) => x !== e) : [...p.equipment, e] });

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

  return (
    <Screen>
      <View>
        <Display size={48}>{p.name}</Display>
        <Body color={colors.muted}>
          {p.bodyWeight} {p.unit} · {p.location === 'gym' ? 'Trains at the gym' : 'Trains at home'}
        </Body>
      </View>

      <Card onPress={split ? () => router.push(`/split/${split.id}`) : undefined}>
        <Label>Current split</Label>
        <Display size={26}>{split?.name ?? 'None'}</Display>
        <Body size={13} color={colors.muted}>
          Change it from the Train tab, or tap here to see the days.
        </Body>
      </Card>

      <Section title="Goal">
        {GOALS.map(([g, label]) => (
          <Chip key={g} label={label} selected={p.goal === g} onPress={() => update({ goal: g })} />
        ))}
      </Section>

      <Section title="Experience">
        {EXPERIENCE.map(([e, label]) => (
          <Chip key={e} label={label} selected={p.experience === e} onPress={() => update({ experience: e })} />
        ))}
      </Section>

      <Section title="Workout days">
        {WEEKDAY_NAMES.map((d, i) => (
          <Chip key={d} label={d} selected={p.days.includes(i as Weekday)} onPress={() => toggleDay(i as Weekday)} />
        ))}
      </Section>

      <Section title="Where you train">
        <Chip label="Gym" selected={p.location === 'gym'} onPress={() => update({ location: 'gym' })} />
        <Chip label="Home" selected={p.location === 'home'} onPress={() => update({ location: 'home' })} />
      </Section>

      {p.location === 'home' ? (
        <Section title="Home equipment">
          {EQUIPMENT.map(([e, label]) => (
            <Chip key={e} label={label} selected={p.equipment.includes(e)} onPress={() => toggleEquip(e)} />
          ))}
        </Section>
      ) : null}

      <Section title="Units">
        <Chip label="kg" selected={p.unit === 'kg'} onPress={() => update({ unit: 'kg' })} />
        <Chip label="lb" selected={p.unit === 'lb'} onPress={() => update({ unit: 'lb' })} />
      </Section>
      <Body size={12} color={colors.faint}>
        Switching units doesn’t convert weights you’ve already logged.
      </Body>

      <Button title="Reset all data" variant="danger" small icon="trash-outline" onPress={reset} style={{ marginTop: space.lg }} />
      <Body size={11} color={colors.faint} style={{ textAlign: 'center' }}>
        Exercise data & photos: free-exercise-db (public domain)
      </Body>
    </Screen>
  );
}
