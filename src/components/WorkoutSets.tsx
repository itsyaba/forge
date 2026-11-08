import { View } from 'react-native';
import { EXERCISE_BY_ID, isBodyweight } from '@/data/catalog';
import type { LoggedExercise, Unit } from '@/lib/types';
import { colors, space } from '@/theme';
import { ExerciseThumb } from './ExerciseDemo';
import { Body, Card, Label, Row } from './ui';

/** Read-only list of exercises and their logged sets. */
export function WorkoutSets({ exercises, unit, prs = [] }: { exercises: LoggedExercise[]; unit: Unit; prs?: string[] }) {
  return (
    <View style={{ gap: space.md }}>
      {exercises.map((e, i) => {
        const ex = EXERCISE_BY_ID[e.exerciseId];
        if (!ex) return null;
        const bw = isBodyweight(ex);
        return (
          <Card key={`${e.exerciseId}-${i}`}>
            <Row gap={space.md}>
              <ExerciseThumb exercise={ex} size={40} />
              <View style={{ flex: 1 }}>
                <Body weight="bold">{ex.name}</Body>
                {prs.includes(e.exerciseId) ? <Label color={colors.accent}>🏆 New personal best</Label> : null}
              </View>
            </Row>
            {e.sets.map((s, j) => (
              <Row key={j} style={{ justifyContent: 'space-between' }}>
                <Body size={14} color={colors.muted}>
                  Set {j + 1}
                </Body>
                <Body size={14} weight="semi">
                  {s.reps} reps{bw || !s.weight ? '' : ` × ${s.weight} ${unit}`}
                </Body>
              </Row>
            ))}
          </Card>
        );
      })}
    </View>
  );
}
