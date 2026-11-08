import { useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { Heatmap, LineChart } from '@/components/charts';
import { Body, Button, Card, Chip, Display, Empty, Label, Row, Screen, Stat, success } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/catalog';
import { exerciseSeries, loggedExerciseIds, setCount, weeklyStreak, workoutDays, workoutVolume } from '@/lib/stats';
import { useHistory } from '@/store/history';
import { useProfile } from '@/store/profile';
import { colors, fonts, radius, space } from '@/theme';

export default function Progress() {
  const workouts = useHistory((s) => s.workouts);
  const bodyWeights = useHistory((s) => s.bodyWeights);
  const profile = useProfile((s) => s.profile)!;
  const target = Math.max(1, profile.days.length);

  const streak = useMemo(() => weeklyStreak(workouts, target), [workouts, target]);
  const days = useMemo(() => workoutDays(workouts), [workouts]);
  const totals = useMemo(
    () => ({
      sets: workouts.reduce((n, w) => n + setCount(w), 0),
      volume: workouts.reduce((n, w) => n + workoutVolume(w), 0),
    }),
    [workouts],
  );
  const weighted = useMemo(
    () => loggedExerciseIds(workouts).filter((id) => exerciseSeries(workouts, id).some((p) => p.best > 0)),
    [workouts],
  );
  const [picked, setPicked] = useState<string | null>(null);
  const exId = picked && weighted.includes(picked) ? picked : weighted[0];
  const series = useMemo(() => (exId ? exerciseSeries(workouts, exId) : []), [workouts, exId]);

  const [bwText, setBwText] = useState('');
  const logWeight = () => {
    const n = parseFloat(bwText.replace(',', '.'));
    if (!(n > 20 && n < 700)) return;
    useHistory.getState().logBodyWeight(n);
    useProfile.getState().update({ bodyWeight: n });
    setBwText('');
    success();
  };

  return (
    <Screen>
      <Display size={48}>Progress</Display>

      <Card>
        <Row style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Label>Week streak</Label>
            <Display size={84} color={colors.accent} style={{ lineHeight: 88 }}>
              {streak.current}
            </Display>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4, paddingBottom: 10 }}>
            <Body size={13} color={colors.muted}>
              Best: {streak.best} week{streak.best === 1 ? '' : 's'}
            </Body>
            <Body size={13} weight="semi">
              This week: {Math.min(streak.thisWeek, target)}/{target}
            </Body>
          </View>
        </Row>
        <Body size={13} color={colors.muted}>
          Hit {target} workout{target === 1 ? '' : 's'} a week to grow your streak.
        </Body>
      </Card>

      <Row>
        <Stat value={workouts.length} label="Workouts" />
        <Stat value={totals.sets} label="Sets" />
        <Stat value={Math.round(totals.volume).toLocaleString()} label={`${profile.unit} lifted`} />
      </Row>

      <Card>
        <Label>Last 12 weeks</Label>
        <Heatmap days={days} />
      </Card>

      <Card>
        <Label>Strength</Label>
        {exId ? (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: space.sm }}>
              {weighted.map((id) => (
                <Chip key={id} label={EXERCISE_BY_ID[id]?.name ?? id} selected={id === exId} onPress={() => setPicked(id)} />
              ))}
            </ScrollView>
            {series.length > 1 ? (
              <LineChart values={series.map((p) => p.best)} suffix={` ${profile.unit}`} />
            ) : (
              <Body color={colors.muted} size={14}>
                Best so far: {series[0]?.best ?? 0} {profile.unit}. Do it again to see your chart.
              </Body>
            )}
          </>
        ) : (
          <Empty title="No lifts yet" body="Log a weighted exercise and your strength chart will appear here." />
        )}
      </Card>

      <Card>
        <Label>Body weight</Label>
        {bodyWeights.length > 1 ? (
          <LineChart values={bodyWeights.map((b) => b.weight)} suffix={` ${profile.unit}`} height={120} />
        ) : (
          <Body color={colors.muted} size={14}>
            Current: {profile.bodyWeight} {profile.unit}. Log your weight weekly to see the trend.
          </Body>
        )}
        <Row>
          <TextInput
            value={bwText}
            onChangeText={setBwText}
            keyboardType="decimal-pad"
            placeholder={`Today's weight (${profile.unit})`}
            placeholderTextColor={colors.faint}
            style={{
              flex: 1,
              fontFamily: fonts.bodySemi,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surfaceHigh,
              borderRadius: radius.pill,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          />
          <Button title="Log" small onPress={logWeight} />
        </Row>
      </Card>
    </Screen>
  );
}
