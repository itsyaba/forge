import { useKeepAwake } from 'expo-keep-awake';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Vibration, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ExerciseDemo } from '@/components/ExerciseDemo';
import { Body, Button, Display, IconButton, Label, ProgressBars, Row, Stepper, success, tap, thud } from '@/components/ui';
import { EXERCISE_BY_ID, isBodyweight } from '@/data/catalog';
import { formatClock, formatDuration } from '@/lib/dates';
import { WEIGHT_STEP } from '@/lib/recommend';
import { saveFinished } from '@/store/finish';
import { useProfile } from '@/store/profile';
import { isFinished, useSession } from '@/store/session';
import { colors, space } from '@/theme';

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export default function WorkoutScreen() {
  useKeepAwake();
  const active = useSession((s) => s.active);
  const unit = useProfile((s) => s.profile?.unit ?? 'kg');
  const [showHow, setShowHow] = useState(false);
  const resting = !!active?.restEndsAt;
  const now = useNow(resting ? 200 : 1000);
  const restLeft = active?.restEndsAt ? (active.restEndsAt - now) / 1000 : 0;

  useEffect(() => {
    if (active?.restEndsAt && restLeft <= 0) {
      useSession.getState().skipRest();
      success();
      Vibration.vibrate(400);
    }
  }, [active?.restEndsAt, restLeft]);

  if (!active) return <Redirect href="/" />;

  const s = useSession.getState();
  const finished = isFinished(active);
  const totalSets = active.exercises.reduce((n, e) => n + e.sets.length, 0);
  const doneCount = active.exercises.reduce((n, e) => n + e.sets.filter((x) => x.done).length, 0);

  const end = () =>
    Alert.alert('End workout?', doneCount ? `You've done ${doneCount} of ${totalSets} sets.` : 'No sets logged yet.', [
      { text: 'Keep going', style: 'cancel' },
      ...(doneCount ? [{ text: 'Finish & save', onPress: () => saveFinished(s.finish()) }] : []),
      {
        text: 'Discard',
        style: 'destructive' as const,
        onPress: () => {
          s.discard();
          router.replace('/');
        },
      },
    ]);

  const header = (
    <Row style={{ justifyContent: 'space-between', paddingHorizontal: space.lg, paddingVertical: space.sm }}>
      <IconButton name="chevron-down" label="Minimize workout" onPress={() => router.back()} />
      <View style={{ alignItems: 'center' }}>
        <Label>{active.title}</Label>
        <Display size={18}>{formatDuration(now - active.startedAt)}</Display>
      </View>
      <IconButton name="close" label="End workout" onPress={end} />
    </Row>
  );

  if (finished) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
        {header}
        <View style={{ flex: 1, justifyContent: 'center', padding: space.lg, gap: space.lg }}>
          <Display size={64} color={colors.accent}>
            All sets done.
          </Display>
          <Body color={colors.muted} size={17}>
            {doneCount} sets in {formatDuration(now - active.startedAt)}. Great work.
          </Body>
          <Button title="Finish workout" icon="flag" onPress={() => saveFinished(s.finish())} />
        </View>
      </SafeAreaView>
    );
  }

  const { ex: exIdx, set: setIdx } = active.cursor;
  const cur = active.exercises[exIdx];
  const ex = EXERCISE_BY_ID[cur.exerciseId];
  const set = cur.sets[setIdx];
  const bw = isBodyweight(ex);
  const lastExercise = exIdx === active.exercises.length - 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      {header}
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: 0, gap: space.md, paddingBottom: space.xxl }}>
        <Label color={resting ? colors.accent : colors.muted}>
          {resting ? (setIdx === 0 ? 'Up next · ' : '') : ''}Exercise {exIdx + 1} / {active.exercises.length}
        </Label>
        <Display size={38}>{ex.name}</Display>

        <ExerciseDemo exercise={ex} />

        <Pressable
          onPress={() => {
            tap();
            setShowHow((v) => !v);
          }}
          accessibilityRole="button"
        >
          <Label color={colors.accent}>{showHow ? '− Hide how to' : '+ How to do it'}</Label>
        </Pressable>
        {showHow ? (
          <View style={{ gap: 6 }}>
            {ex.instructions.map((t, i) => (
              <Body key={i} size={14} color={colors.muted}>
                {i + 1}. {t}
              </Body>
            ))}
          </View>
        ) : null}

        <ProgressBars total={cur.sets.length} done={cur.sets.filter((x) => x.done).length} current={setIdx} />
        <Body weight="semi" color={colors.muted} style={{ textAlign: 'center' }}>
          SET {setIdx + 1} OF {cur.sets.length} · {set.targetReps} REPS{!bw && set.weight ? ` · ${set.weight} ${unit}` : ''}
        </Body>

        {resting ? (
          <View style={{ alignItems: 'center', gap: space.md, paddingVertical: space.sm }}>
            <Label>Rest</Label>
            <Display size={96} color={colors.accent} style={{ lineHeight: 100 }}>
              {formatClock(restLeft)}
            </Display>
            <Row gap={space.md}>
              <Button title="+15s" variant="dark" small onPress={() => s.addRest(15)} />
              <Button title="Skip rest" variant="ghost" small onPress={() => s.skipRest()} />
            </Row>
          </View>
        ) : (
          <>
            <Row style={{ justifyContent: 'space-around', paddingVertical: space.sm }}>
              <Stepper label="Reps" value={set.reps} onChange={(reps) => s.setCurrentSet({ reps })} />
              {bw ? null : (
                <Stepper label={unit} value={set.weight} step={WEIGHT_STEP[unit]} max={2000} onChange={(weight) => s.setCurrentSet({ weight })} />
              )}
            </Row>
            <Button
              title={lastExercise && setIdx === cur.sets.length - 1 ? 'Last set done' : 'Set done'}
              icon="checkmark"
              onPress={() => {
                thud();
                s.completeSet();
              }}
            />
          </>
        )}

        <Button title={lastExercise ? 'Skip to finish' : 'Skip exercise'} variant="ghost" small style={{ alignSelf: 'center' }} onPress={() => s.skipExercise()} />
      </ScrollView>
    </SafeAreaView>
  );
}
