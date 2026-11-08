import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, View } from 'react-native';
import { ExerciseThumb, prefetchExerciseImages } from '@/components/ExerciseDemo';
import { NumberField } from '@/components/NumberField';
import { Body, Button, Card, Display, Empty, IconButton, Label, Row, Screen, Stepper, thud } from '@/components/ui';
import { EXERCISE_BY_ID, isBodyweight } from '@/data/catalog';
import { formatClock } from '@/lib/dates';
import { WEIGHT_STEP } from '@/lib/recommend';
import { useProfile } from '@/store/profile';
import { useSession } from '@/store/session';
import { colors, space } from '@/theme';

export default function Plan() {
  const draft = useSession((s) => s.draft);
  const unit = useProfile((s) => s.profile!.unit);
  const { updateDraftExercise, removeDraftExercise } = useSession.getState();

  // download every demo photo now so the workout screen shows them instantly
  const idsKey = draft?.exercises.map((e) => e.exerciseId).join(',') ?? '';
  useEffect(() => {
    if (idsKey) prefetchExerciseImages(idsKey.split(',').map((id) => EXERCISE_BY_ID[id]).filter(Boolean));
  }, [idsKey]);

  if (!draft) {
    return (
      <Screen edges={['bottom']}>
        <Empty title="Nothing planned" body="Pick a muscle or a split day on the Train tab." action={<Button title="Back" variant="ghost" onPress={() => router.back()} />} />
      </Screen>
    );
  }

  const totalSets = draft.exercises.reduce((n, e) => n + e.sets.length, 0);
  const estMin = Math.round(
    draft.exercises.reduce((sec, e) => sec + e.sets.length * (40 + e.restSec), 0) / 60,
  );

  const start = () => {
    const go = () => {
      useSession.getState().startWorkout();
      thud();
      router.replace('/workout');
    };
    if (useSession.getState().active) {
      Alert.alert('Workout in progress', 'Starting this one will discard your current workout.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Discard & start', style: 'destructive', onPress: go },
      ]);
    } else go();
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={100}>
      <Screen
        edges={['bottom']}
        footer={<Button title="Start workout" icon="play" onPress={start} disabled={!draft.exercises.length || !totalSets} />}
      >
        <View style={{ gap: 4 }}>
          <Display size={42}>{draft.title}</Display>
          <Body color={colors.muted}>
            {draft.exercises.length} exercises · {totalSets} sets · ~{estMin} min
          </Body>
          <Body size={13} color={colors.muted}>
            We filled in sets, reps and rest for you. Tap any number to change it.
          </Body>
        </View>

        {draft.exercises.map((pe, idx) => {
          const ex = EXERCISE_BY_ID[pe.exerciseId];
          const bw = isBodyweight(ex);
          return (
            <Card key={pe.exerciseId}>
              <Row gap={space.md}>
                <Pressable onPress={() => router.push(`/exercise/${ex.id}`)} accessibilityRole="button" accessibilityLabel={`How to do ${ex.name}`}>
                  <ExerciseThumb exercise={ex} size={48} />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Body weight="bold" numberOfLines={2}>
                    {ex.name}
                  </Body>
                  {pe.bumped ? (
                    <Label color={colors.accent}>
                      +{WEIGHT_STEP[unit]} {unit} vs last time 💪
                    </Label>
                  ) : null}
                </View>
                <IconButton name="trash-outline" label={`Remove ${ex.name}`} color={colors.muted} size={20} onPress={() => removeDraftExercise(idx)} />
              </Row>

              <View style={{ gap: space.sm, marginTop: space.xs }}>
                {pe.sets.map((st, si) => (
                  <Row key={si} style={{ justifyContent: 'space-between' }}>
                    <Display size={18} color={colors.muted} style={{ width: 56 }}>
                      Set {si + 1}
                    </Display>
                    <NumberField
                      label="reps"
                      value={st.reps}
                      onChange={(reps) =>
                        updateDraftExercise(idx, (e) => ({ ...e, sets: e.sets.map((x, j) => (j === si ? { ...x, reps } : x)) }))
                      }
                    />
                    {bw ? (
                      <View style={{ width: 88, alignItems: 'center' }}>
                        <Body size={12} color={colors.muted}>
                          Bodyweight
                        </Body>
                      </View>
                    ) : (
                      <NumberField
                        label={unit}
                        decimals
                        width={88}
                        value={st.weight}
                        onChange={(weight) =>
                          updateDraftExercise(idx, (e) => ({
                            ...e,
                            // changing a weight also updates the sets below it
                            sets: e.sets.map((x, j) => (j === si || (j > si && x.weight === st.weight) ? { ...x, weight } : x)),
                          }))
                        }
                      />
                    )}
                    <IconButton
                      name="close"
                      size={18}
                      color={colors.faint}
                      label={`Remove set ${si + 1}`}
                      onPress={() => updateDraftExercise(idx, (e) => ({ ...e, sets: e.sets.filter((_, j) => j !== si) }))}
                    />
                  </Row>
                ))}
              </View>

              <Row style={{ justifyContent: 'space-between', marginTop: space.xs }}>
                <Button
                  title="Add set"
                  icon="add"
                  variant="ghost"
                  small
                  onPress={() =>
                    updateDraftExercise(idx, (e) => ({
                      ...e,
                      sets: [...e.sets, e.sets[e.sets.length - 1] ?? { reps: 10, weight: 0 }],
                    }))
                  }
                />
                <Row gap={4}>
                  <Ionicons name="timer-outline" size={16} color={colors.muted} />
                  <Body size={13} color={colors.muted}>
                    Rest
                  </Body>
                  <Stepper
                    value={pe.restSec}
                    step={15}
                    min={0}
                    max={600}
                    suffix="s"
                    onChange={(restSec) => updateDraftExercise(idx, (e) => ({ ...e, restSec }))}
                  />
                </Row>
              </Row>
              <Body size={11} color={colors.faint} style={{ textAlign: 'right' }}>
                {formatClock(pe.restSec)} between sets
              </Body>
            </Card>
          );
        })}

        <Button title="Add exercise" icon="add" variant="ghost" onPress={() => router.push('/add-exercise')} />
      </Screen>
    </KeyboardAvoidingView>
  );
}
