import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { View } from 'react-native';
import { Body, Button, Card, Display, Label, Row, Screen, Stat } from '@/components/ui';
import { WorkoutSets } from '@/components/WorkoutSets';
import { EXERCISE_BY_ID } from '@/data/catalog';
import { formatDuration } from '@/lib/dates';
import { daysLeftThisWeek, estimateCalories, personalRecords, setCount, weeklyStreak, workoutVolume } from '@/lib/stats';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { colors, space } from '@/theme';

export default function Summary() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const workouts = useHistory((s) => s.workouts);
  const profile = useProfile((s) => s.profile)!;
  const w = workouts.find((x) => x.id === id);
  const prs = useMemo(() => (w ? personalRecords(w, workouts) : []), [w, workouts]);
  const streak = useMemo(() => weeklyStreak(workouts, profile.days.length), [workouts, profile.days.length]);

  if (!w) return null;
  const duration = w.endedAt - w.startedAt;
  const target = Math.max(1, profile.days.length);

  return (
    <Screen edges={['top', 'bottom']} footer={<Button title="Done" onPress={() => router.replace('/')} />}>
      <View>
        <Label color={colors.accent}>Workout complete</Label>
        <Display size={52}>{w.title}</Display>
        <Display size={52} color={colors.accent}>
          crushed.
        </Display>
      </View>

      <Row style={{ alignItems: 'flex-start' }}>
        <Stat value={formatDuration(duration)} label="Time" />
        <Stat value={setCount(w)} label="Sets" />
        <Stat value={Math.round(workoutVolume(w)).toLocaleString()} label={`Volume ${profile.unit}`} />
      </Row>
      <Row style={{ alignItems: 'flex-start' }}>
        <Stat value={`~${estimateCalories(duration, profile.bodyWeight, profile.unit)}`} label="Calories" />
        <Stat value={`${Math.min(streak.thisWeek, target)}/${target}`} label="This week" accent />
        <Stat value={streak.current} label="Week streak" accent />
      </Row>

      {prs.length ? (
        <Card accent>
          <Label color={colors.onAccent}>New personal best{prs.length > 1 ? 's' : ''}</Label>
          {prs.map((pid) => (
            <Display key={pid} size={22} color={colors.onAccent}>
              🏆 {EXERCISE_BY_ID[pid]?.name}
            </Display>
          ))}
        </Card>
      ) : null}

      {streak.thisWeek >= target ? (
        <Body color={colors.accent} weight="semi">
          Weekly goal hit! Your streak is safe for this week.
        </Body>
      ) : (
        <Body color={colors.muted}>
          {target - streak.thisWeek <= daysLeftThisWeek()
            ? `${target - streak.thisWeek} more workout${target - streak.thisWeek === 1 ? '' : 's'} this week to keep your streak going.`
            : `That one counts. New week Monday: hit ${target} to build your streak.`}
        </Body>
      )}

      <View style={{ gap: space.sm }}>
        <Label>What you did</Label>
        <WorkoutSets exercises={w.exercises} unit={profile.unit} prs={prs} />
      </View>
    </Screen>
  );
}
