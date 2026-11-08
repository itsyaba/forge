import { useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';
import { ExerciseDemo } from '@/components/ExerciseDemo';
import { Body, Chip, Display, Label, Row, Screen } from '@/components/ui';
import { EXERCISE_BY_ID } from '@/data/catalog';
import { colors, space } from '@/theme';

export default function ExerciseDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ex = EXERCISE_BY_ID[id];
  if (!ex) return null;
  return (
    <Screen edges={['bottom']}>
      <ExerciseDemo exercise={ex} />
      <Display size={36}>{ex.name}</Display>
      <Row style={{ flexWrap: 'wrap' }}>
        {ex.primary.map((m) => (
          <Chip key={m} label={m} selected />
        ))}
        {ex.secondary.map((m) => (
          <Chip key={m} label={m} />
        ))}
      </Row>
      <Body color={colors.muted}>
        {ex.equipment} · {ex.level} · {ex.mechanic ?? 'bodyweight'}
      </Body>
      <View style={{ gap: space.md }}>
        <Label>How to do it</Label>
        {ex.instructions.map((step, i) => (
          <Row key={i} style={{ alignItems: 'flex-start' }} gap={space.md}>
            <Display size={20} color={colors.accent} style={{ width: 22 }}>
              {i + 1}
            </Display>
            <Body style={{ flex: 1 }}>{step}</Body>
          </Row>
        ))}
      </View>
    </Screen>
  );
}
